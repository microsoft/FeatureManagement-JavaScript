// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { IFeatureFilter } from "./FeatureFilter.js";
import { isTargetedPercentile } from "../common/targetingEvaluator.js";
import { ITargetingContext } from "../common/targetingContext.js";

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
    name: string = "Microsoft.Targeting";

    async evaluate(context: TargetingFilterEvaluationContext, appContext?: ITargetingContext): Promise<boolean> {
        const { featureName, parameters } = context;
        TargetingFilter.#validateParameters(featureName, parameters);

        if (parameters.Audience.Exclusion !== undefined) {
            // check if the user is in the exclusion list
            if (appContext?.userId !== undefined &&
                parameters.Audience.Exclusion.Users !== undefined &&
                parameters.Audience.Exclusion.Users.includes(appContext.userId)) {
                return false;
            }
            // check if the user is in a group within exclusion list
            if (appContext?.groups !== undefined &&
                parameters.Audience.Exclusion.Groups !== undefined) {
                for (const excludedGroup of parameters.Audience.Exclusion.Groups) {
                    if (appContext.groups.includes(excludedGroup)) {
                        return false;
                    }
                }
            }
        }

        // check if the user is being targeted directly
        if (appContext?.userId !== undefined &&
            parameters.Audience.Users !== undefined &&
            parameters.Audience.Users.includes(appContext.userId)) {
            return true;
        }

        // check if the user is in a group that is being targeted
        if (appContext?.groups !== undefined &&
            parameters.Audience.Groups !== undefined) {
            for (const group of parameters.Audience.Groups) {
                if (appContext.groups.includes(group.Name)) {
                    const hint = `${featureName}\n${group.Name}`;
                    if (await isTargetedPercentile(appContext.userId, hint, 0, group.RolloutPercentage)) {
                        return true;
                    }
                }
            }
        }

        // check if the user is being targeted by a default rollout percentage
        const hint = featureName;
        return isTargetedPercentile(appContext?.userId, hint, 0, parameters.Audience.DefaultRolloutPercentage);
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
