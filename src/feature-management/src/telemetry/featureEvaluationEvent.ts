// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { EvaluationResult } from "../featureManager";
import { EVALUATION_EVENT_VERSION } from "../version.js";

const VERSION = "Version";
const FEATURE_NAME = "FeatureName";
const ENABLED = "Enabled";
const TARGETING_ID = "TargetingId";
const VARIANT = "Variant";
const VARIANT_ASSIGNMENT_REASON = "VariantAssignmentReason";

export function createFeatureEvaluationEventProperties(result: EvaluationResult): any {
    if (result.feature === undefined) {
        return undefined;
    }

    const eventProperties = {
        [VERSION]: EVALUATION_EVENT_VERSION,
        [FEATURE_NAME]: result.feature ? result.feature.id : "",
        [ENABLED]: result.enabled ? "True" : "False",
        // Ensure targetingId is string so that it will be placed in customDimensions
        [TARGETING_ID]: result.targetingId ? result.targetingId.toString() : "",
        [VARIANT]: result.variant ? result.variant.name : "",
        [VARIANT_ASSIGNMENT_REASON]: result.variantAssignmentReason,
    };

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
