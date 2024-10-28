// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { EvaluationResult, VariantAssignmentReason } from "@microsoft/feature-management";
import { ApplicationInsights, IEventTelemetry } from "@microsoft/applicationinsights-web";
import { EVALUATION_EVENT_VERSION } from "./version.js";

const VERSION = "Version";
const FEATURE_NAME = "FeatureName";
const ENABLED = "Enabled";
const TARGETING_ID = "TargetingId";
const VARIANT = "Variant";
const VARIANT_ASSIGNMENT_REASON = "VariantAssignmentReason";
const DEFAULT_WHEN_ENABLED = "DefaultWhenEnabled";
const VARIANT_ASSIGNMENT_PERCENTAGE = "VariantAssignmentPercentage";
const FEATURE_EVALUATION_EVENT_NAME = "FeatureEvaluation";

/**
 * Creates a telemetry publisher that sends feature evaluation events to Application Insights.
 * @param client The Application Insights telemetry client.
 * @returns A callback function that takes an evaluation result and tracks an event with the evaluation details.
 */
export function createTelemetryPublisher(client: ApplicationInsights): (event: EvaluationResult) => void {
    return (event: EvaluationResult) => {
        if (event.feature === undefined) {
            return;
        }

        const eventProperties = {
            [VERSION]: EVALUATION_EVENT_VERSION,
            [FEATURE_NAME]: event.feature ? event.feature.id : "",
            [ENABLED]: event.enabled.toString(),
            // Ensure targetingId is string so that it will be placed in customDimensions
            [TARGETING_ID]: event.targetingId ? event.targetingId.toString() : "",
            [VARIANT]: event.variant ? event.variant.name : "",
            [VARIANT_ASSIGNMENT_REASON]: event.variantAssignmentReason,
        };

        if (event.feature.allocation?.default_when_enabled) {
            eventProperties[DEFAULT_WHEN_ENABLED] = event.feature.allocation.default_when_enabled;
        }

        if (event.variantAssignmentReason === VariantAssignmentReason.DefaultWhenEnabled) {
            let percentileAllocationPercentage = 0;
            if (event.variant !== undefined && event.feature.allocation !== undefined && event.feature.allocation.percentile !== undefined) {
                for (const percentile of event.feature.allocation.percentile) {
                    percentileAllocationPercentage += percentile.to - percentile.from;
                }
            }
            eventProperties[VARIANT_ASSIGNMENT_PERCENTAGE] = (100 - percentileAllocationPercentage).toString();
        }
        else if (event.variantAssignmentReason === VariantAssignmentReason.Percentile) {
            let percentileAllocationPercentage = 0;
            if (event.variant !== undefined && event.feature.allocation !== undefined && event.feature.allocation.percentile !== undefined) {
                for (const percentile of event.feature.allocation.percentile) {
                    if (percentile.variant === event.variant.name) {
                        percentileAllocationPercentage += percentile.to - percentile.from;
                    }
                }
            }
            eventProperties[VARIANT_ASSIGNMENT_PERCENTAGE] = percentileAllocationPercentage.toString();
        }

        const metadata = event.feature.telemetry?.metadata;
        if (metadata) {
            for (const key in metadata) {
                if (!(key in eventProperties)) {
                    eventProperties[key] = metadata[key];
                }
            }
        }

        client.trackEvent({ name: FEATURE_EVALUATION_EVENT_NAME }, eventProperties);
    };
}

/**
 * Tracks a custom event using Application Insights, ensuring that the "TargetingId"
 * is included in the custom properties. If the "TargetingId" already exists in
 * the provided custom properties, it will be overwritten.
 *
 * @param client The Application Insights client instance used to track the event.
 * @param targetingId The unique targeting identifier that will be included in the custom properties.
 * @param event The event telemetry object to be tracked, containing event details.
 * @param customProperties (Optional) Additional properties to include in the event telemetry.
 */
export function trackEvent(client: ApplicationInsights, targetingId: string, event: IEventTelemetry, customProperties?: {[key: string]: any}): void {
    const properties = customProperties ? { ...customProperties } : {};
    // Ensure targetingId is string so that it will be placed in customDimensions
    properties[TARGETING_ID] = targetingId ? targetingId.toString() : "";
    client.trackEvent(event, properties);
}
