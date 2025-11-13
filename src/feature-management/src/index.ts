// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export { FeatureManager, FeatureManagerOptions, EvaluationResult, VariantAssignmentReason } from "./featureManager.js";
export { IFeatureFlagProvider, IFeatureManager } from "./model.js";
export { ConfigurationMapFeatureFlagProvider, ConfigurationObjectFeatureFlagProvider } from "./featureProvider.js";
export { createFeatureEvaluationEventProperties } from "./telemetry/featureEvaluationEvent.js";
export { IFeatureFilter, IFeatureFilterEvaluationContext } from "./filter/featureFilter.js";
export { ITargetingContext, ITargetingContextAccessor } from "./common/targetingContext.js";
export { VERSION } from "./version.js";
