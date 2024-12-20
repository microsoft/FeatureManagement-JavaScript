// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { IGettable } from "./gettable.js";
import { FeatureFlag, FeatureManagementConfiguration, FEATURE_MANAGEMENT_KEY, FEATURE_FLAGS_KEY } from "./schema/model.js";
import { validateFeatureFlag } from "./schema/validator.js";

export interface IFeatureFlagProvider {
    /**
     * Get all feature flags.
     */
    getFeatureFlags(): Promise<FeatureFlag[]>;

    /**
     * Get a feature flag by name.
     * @param featureName The name of the feature flag.
     */
    getFeatureFlag(featureName: string): Promise<FeatureFlag | undefined>;
}

/**
 * A feature flag provider that uses a map-like configuration to provide feature flags.
 */
export class ConfigurationMapFeatureFlagProvider implements IFeatureFlagProvider {
    #configuration: IGettable;

    constructor(configuration: IGettable) {
        this.#configuration = configuration;
    }
    async getFeatureFlag(featureName: string): Promise<FeatureFlag | undefined> {
        const featureConfig = this.#configuration.get<FeatureManagementConfiguration>(FEATURE_MANAGEMENT_KEY);
        const featureFlag = featureConfig?.[FEATURE_FLAGS_KEY]?.findLast((feature) => feature.id === featureName);
        validateFeatureFlag(featureFlag);
        return featureFlag;
    }

    async getFeatureFlags(): Promise<FeatureFlag[]> {
        const featureConfig = this.#configuration.get<FeatureManagementConfiguration>(FEATURE_MANAGEMENT_KEY);
        const featureFlag = featureConfig?.[FEATURE_FLAGS_KEY] ?? [];
        validateFeatureFlag(featureFlag);
        return featureFlag;
    }
}

/**
 * A feature flag provider that uses an object-like configuration to provide feature flags.
 */
export class ConfigurationObjectFeatureFlagProvider implements IFeatureFlagProvider {
    #configuration: Record<string, unknown>;

    constructor(configuration: Record<string, unknown>) {
        this.#configuration = configuration;
    }

    async getFeatureFlag(featureName: string): Promise<FeatureFlag | undefined> {
        const featureFlags = this.#configuration[FEATURE_MANAGEMENT_KEY]?.[FEATURE_FLAGS_KEY];
        const featureFlag = featureFlags?.findLast((feature: FeatureFlag) => feature.id === featureName);
        validateFeatureFlag(featureFlag);
        return featureFlag;
    }

    async getFeatureFlags(): Promise<FeatureFlag[]> {
        const featureFlag = this.#configuration[FEATURE_MANAGEMENT_KEY]?.[FEATURE_FLAGS_KEY] ?? [];
        validateFeatureFlag(featureFlag);
        return featureFlag;
    }
}
