// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { TimeWindowFilter } from "./filter/TimeWindowFilter.js";
import { IFeatureFilter } from "./filter/FeatureFilter.js";
import { RequirementType } from "./schema/model.js";
import { IFeatureFlagProvider } from "./featureProvider.js";
import { TargetingFilter } from "./filter/TargetingFilter.js";

export class FeatureManager {
    #provider: IFeatureFlagProvider;
    #featureFilters: Map<string, IFeatureFilter> = new Map();

    constructor(provider: IFeatureFlagProvider, options?: FeatureManagerOptions) {
        this.#provider = provider;

        const builtinFilters = [new TimeWindowFilter(), new TargetingFilter()];

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
        const featureFlag = await this.#getFeatureFlag(featureName);
        if (featureFlag === undefined) {
            // If the feature is not found, then it is disabled.
            return false;
        }

        if (featureFlag.enabled !== true) {
            // If the feature is not explicitly enabled, then it is disabled by default.
            return false;
        }

        const clientFilters = featureFlag.conditions?.client_filters;
        if (clientFilters === undefined || clientFilters.length <= 0) {
            // If there are no client filters, then the feature is enabled.
            return true;
        }

        const requirementType: RequirementType = featureFlag.conditions?.requirement_type ?? "Any"; // default to any.

        /**
         * While iterating through the client filters, we short-circuit the evaluation based on the requirement type.
         * - When requirement type is "All", the feature is enabled if all client filters are matched. If any client filter is not matched, the feature is disabled, otherwise it is enabled. `shortCircuitEvaluationResult` is false.
         * - When requirement type is "Any", the feature is enabled if any client filter is matched. If any client filter is matched, the feature is enabled, otherwise it is disabled. `shortCircuitEvaluationResult` is true.
         */
        const shortCircuitEvaluationResult: boolean = requirementType === "Any";

        for (const clientFilter of clientFilters) {
            const matchedFeatureFilter = this.#featureFilters.get(clientFilter.name);
            const contextWithFeatureName = { featureName, parameters: clientFilter.parameters };
            if (matchedFeatureFilter === undefined) {
                console.warn(`Feature filter ${clientFilter.name} is not found.`);
                return false;
            }
            if (await matchedFeatureFilter.evaluate(contextWithFeatureName, context) === shortCircuitEvaluationResult) {
                return shortCircuitEvaluationResult;
            }
        }

        // If we get here, then we have not found a client filter that matches the requirement type.
        return !shortCircuitEvaluationResult;
    }

    async #getFeatureFlag(featureName: string): Promise<any> {
        const featureFlag = await this.#provider.getFeatureFlag(featureName);
        return featureFlag;
    }

}

interface FeatureManagerOptions {
    customFilters?: IFeatureFilter[];
}
