// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export { FeatureManager, FeatureManagerOptions, EvaluationResult, VariantAssignmentReason } from "./featureManager.js";
export { ConfigurationMapFeatureFlagProvider, ConfigurationObjectFeatureFlagProvider, IFeatureFlagProvider } from "./featureProvider.js";
export { createFeatureEvaluationEventProperties } from "./telemetry/featureEvaluationEvent.js";
export { IFeatureFilter } from "./filter/featureFilter.js";
export { VERSION } from "./version.js";
