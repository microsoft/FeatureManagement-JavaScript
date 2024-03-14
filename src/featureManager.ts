// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { TimewindowFilter } from "./filter/TimeWindowFilter";
import { IFeatureFilter } from "./filter/FeatureFilter";
import { RequirementType } from "./model";
import { IFeatureFlagProvider } from "./featureProvider";

export class FeatureManager {
    #provider: IFeatureFlagProvider;
    #featureFilters: Map<string, IFeatureFilter> = new Map();

    constructor(provider: IFeatureFlagProvider, options?: FeatureManagerOptions) {
        this.#provider = provider;

        const builtinFilters = [new TimewindowFilter()]; // TODO: add TargetFilter as built-in filter.

        // If a custom filter shares a name with an existing filter, the custom filter overrides the existing one.
        for (const filter of [...builtinFilters, ...(options?.customFilters ?? [])]) {
            this.#featureFilters.set(filter.name, filter);
        }
    }

    async listFeatureNames(): Promise<string[]> {
        const features = await this.#provider.getFeatureFlags();
        const featureNameSet = new Set(features.map((feature) => feature.id));
        return Array.from(featureNameSet);
    }

    // If multiple feature flags are found, the first one takes precedence.
    async isEnabled(featureName: string, context?: unknown): Promise<boolean> {
        const featureFlag = await this.#provider.getFeatureFlag(featureName);
        if (featureFlag === undefined) {
            // If the feature is not found, then it is disabled.
            return false;
        }

        if (featureFlag.enabled === false) {
            // If the feature is explicitly disabled, then it is disabled.
            return false;
        }

        const clientFilters = featureFlag.conditions?.client_filters;
        if (clientFilters !== undefined) {
            const requirementType = featureFlag.conditions?.requirement_type ?? RequirementType.Any; // default to any.
            for (const clientFilter of clientFilters) {
                const matchedFeatureFilter = this.#featureFilters.get(clientFilter.name);
                const contextWithFeatureName = { featureName, parameters: clientFilter.parameters };
                if (matchedFeatureFilter !== undefined) {
                    if (requirementType === RequirementType.Any && await matchedFeatureFilter.evaluate(contextWithFeatureName, context)) {
                        return true;
                    } else if (requirementType === RequirementType.All && !await matchedFeatureFilter.evaluate(contextWithFeatureName, context)) {
                        return false;
                    }
                } else {
                    console.warn(`Feature filter ${clientFilter.name} is not found.`);
                    return false;
                }
            }

            // If we get here, then we have not found a client filter that matches the requirement type.
            if (requirementType === RequirementType.Any) {
                return false;
            } else {
                return true;
            }
        } else {
            // If there are no client filters, then the feature is enabled.
            return true;
        }
    }

}

interface FeatureManagerOptions {
    customFilters?: IFeatureFilter[];
}
