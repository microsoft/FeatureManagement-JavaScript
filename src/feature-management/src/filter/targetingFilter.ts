// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { IFeatureFilter } from "./featureFilter.js";
import { isTargetedPercentile } from "../common/targetingEvaluator.js";
import { ITargetingContext, ITargetingContextAccessor } from "../common/targetingContext.js";

type TargetingFilterParameters = {
    Audience: {
        DefaultRolloutPercentage: number;
        Users?: string[];
        Groups?: {
            Name: string;
            RolloutPercentage: number;
        }[];
        Exclusion?: {
            Users?: string[];
            Groups?: string[];
        };
    }
}

type TargetingFilterEvaluationContext = {
    featureName: string;
    parameters: TargetingFilterParameters;
}

export class TargetingFilter implements IFeatureFilter {
    readonly name: string = "Microsoft.Targeting";
    readonly #targetingContextAccessor?: ITargetingContextAccessor;

    constructor(targetingContextAccessor?: ITargetingContextAccessor) {
        this.#targetingContextAccessor = targetingContextAccessor;
    }

    async evaluate(context: TargetingFilterEvaluationContext, appContext?: ITargetingContext): Promise<boolean> {
        const { featureName, parameters } = context;
        TargetingFilter.#validateParameters(featureName, parameters);

        let targetingContext: ITargetingContext | undefined;
        if (appContext?.userId !== undefined || appContext?.groups !== undefined) {
            targetingContext = appContext;
        } else if (this.#targetingContextAccessor !== undefined) {
            targetingContext = this.#targetingContextAccessor.getTargetingContext();
        }

        if (parameters.Audience.Exclusion !== undefined) {
            // check if the user is in the exclusion list
            if (targetingContext?.userId !== undefined &&
                parameters.Audience.Exclusion.Users !== undefined &&
                parameters.Audience.Exclusion.Users.includes(targetingContext.userId)) {
                return false;
            }
            // check if the user is in a group within exclusion list
            if (targetingContext?.groups !== undefined &&
                parameters.Audience.Exclusion.Groups !== undefined) {
                for (const excludedGroup of parameters.Audience.Exclusion.Groups) {
                    if (targetingContext.groups.includes(excludedGroup)) {
                        return false;
                    }
                }
            }
        }

        // check if the user is being targeted directly
        if (targetingContext?.userId !== undefined &&
            parameters.Audience.Users !== undefined &&
            parameters.Audience.Users.includes(targetingContext.userId)) {
            return true;
        }

        // check if the user is in a group that is being targeted
        if (targetingContext?.groups !== undefined &&
            parameters.Audience.Groups !== undefined) {
            for (const group of parameters.Audience.Groups) {
                if (targetingContext.groups.includes(group.Name)) {
                    const hint = `${featureName}\n${group.Name}`;
                    if (await isTargetedPercentile(targetingContext.userId, hint, 0, group.RolloutPercentage)) {
                        return true;
                    }
                }
            }
        }

        // check if the user is being targeted by a default rollout percentage
        const hint = featureName;
        return isTargetedPercentile(targetingContext?.userId, hint, 0, parameters.Audience.DefaultRolloutPercentage);
    }

    static #validateParameters(featureName: string, parameters: TargetingFilterParameters): void {
        if (parameters.Audience.DefaultRolloutPercentage < 0 || parameters.Audience.DefaultRolloutPercentage > 100) {
            throw new Error(`Invalid feature flag: ${featureName}. Audience.DefaultRolloutPercentage must be a number between 0 and 100.`);
        }
        // validate RolloutPercentage for each group
        if (parameters.Audience.Groups !== undefined) {
            for (const group of parameters.Audience.Groups) {
                if (group.RolloutPercentage < 0 || group.RolloutPercentage > 100) {
                    throw new Error(`Invalid feature flag: ${featureName}. RolloutPercentage of group ${group.Name} must be a number between 0 and 100.`);
                }
            }
        }
    }
}
