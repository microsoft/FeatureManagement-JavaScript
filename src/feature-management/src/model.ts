// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ITargetingContext } from "./common/targetingContext.js";
import { FeatureFlag } from "./schema/model.js";
import { Variant } from "./variant/variant.js";

export interface IFeatureManager {
    /**
     * Get the list of feature names.
     */
    listFeatureNames(): Promise<string[]>;

    /**
     * Check if a feature is enabled.
     * @param featureName name of the feature.
     * @param context an object providing information that can be used to evaluate whether a feature should be on or off.
     */
    isEnabled(featureName: string, context?: unknown): Promise<boolean>;

    /**
     * Get the allocated variant of a feature given the targeting context.
     * @param featureName name of the feature.
     * @param context a targeting context object used to evaluate which variant the user will be assigned.
     */
    getVariant(featureName: string, context: ITargetingContext): Promise<Variant | undefined>;
}

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
