// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { EvaluationResult, VariantAssignmentReason } from "../featureManager";
import { EVALUATION_EVENT_VERSION } from "../version.js";

const VERSION = "Version";
const FEATURE_NAME = "FeatureName";
const ENABLED = "Enabled";
const TARGETING_ID = "TargetingId";
const VARIANT = "Variant";
const VARIANT_ASSIGNMENT_REASON = "VariantAssignmentReason";
const DEFAULT_WHEN_ENABLED = "DefaultWhenEnabled";
const VARIANT_ASSIGNMENT_PERCENTAGE = "VariantAssignmentPercentage";

export function createFeatureEvaluationEventProperties(result: EvaluationResult): any {
    if (result.feature === undefined) {
        return undefined;
    }

    const eventProperties = {
        [VERSION]: EVALUATION_EVENT_VERSION,
        [FEATURE_NAME]: result.feature ? result.feature.id : "",
        [ENABLED]: result.enabled.toString(),
        // Ensure targetingId is string so that it will be placed in customDimensions
        [TARGETING_ID]: result.targetingId ? result.targetingId.toString() : "",
        [VARIANT]: result.variant ? result.variant.name : "",
        [VARIANT_ASSIGNMENT_REASON]: result.variantAssignmentReason,
    };

    if (result.feature.allocation?.default_when_enabled) {
        eventProperties[DEFAULT_WHEN_ENABLED] = result.feature.allocation.default_when_enabled;
    }

    if (result.variantAssignmentReason === VariantAssignmentReason.DefaultWhenEnabled) {
        let percentileAllocationPercentage = 0;
        if (result.variant !== undefined && result.feature.allocation !== undefined && result.feature.allocation.percentile !== undefined) {
            for (const percentile of result.feature.allocation.percentile) {
                percentileAllocationPercentage += percentile.to - percentile.from;
            }
        }
        eventProperties[VARIANT_ASSIGNMENT_PERCENTAGE] = (100 - percentileAllocationPercentage).toString();
    }
    else if (result.variantAssignmentReason === VariantAssignmentReason.Percentile) {
        let percentileAllocationPercentage = 0;
        if (result.variant !== undefined && result.feature.allocation !== undefined && result.feature.allocation.percentile !== undefined) {
            for (const percentile of result.feature.allocation.percentile) {
                if (percentile.variant === result.variant.name) {
                    percentileAllocationPercentage += percentile.to - percentile.from;
                }
            }
        }
        eventProperties[VARIANT_ASSIGNMENT_PERCENTAGE] = percentileAllocationPercentage.toString();
    }

    const metadata = result.feature.telemetry?.metadata;
    if (metadata) {
        for (const key in metadata) {
            if (!(key in eventProperties)) {
                eventProperties[key] = metadata[key];
            }
        }
    }

    return eventProperties;
}
