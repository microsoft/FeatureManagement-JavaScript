// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { EvaluationResult, VariantAssignmentReason } from "@microsoft/feature-management";
import { ApplicationInsights, IEventTelemetry } from "@microsoft/applicationinsights-web";
import { EVALUATION_EVENT_VERSION } from "./version.js";

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
            "Version": EVALUATION_EVENT_VERSION,
            "FeatureName": event.feature.id,
            "Enabled": event.enabled.toString(),
            // Ensure targetingId is string so that it will be placed in customDimensions
            "TargetingId": event.targetingId?.toString(),
            "Variant": event.variant?.name,
            "VariantAssignmentReason": event.variantAssignmentReason,
        };

        if (event.feature.allocation?.default_when_enabled) {
            eventProperties["DefaultWhenEnabled"] = event.feature.allocation.default_when_enabled;
        }

        if (event.variantAssignmentReason === VariantAssignmentReason.DefaultWhenEnabled) {
            let percentileAllocationPercentage = 0;
            if (event.variant !== undefined && event.feature.allocation !== undefined && event.feature.allocation.percentile !== undefined) {
                for (const percentile of event.feature.allocation.percentile) {
                    percentileAllocationPercentage += percentile.to - percentile.from;
                }
            }
            eventProperties["VariantAssignmentPercentage"] = (100 - percentileAllocationPercentage).toString();
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
            eventProperties["VariantAssignmentPercentage"] = percentileAllocationPercentage.toString();
        }

        const metadata = event.feature.telemetry?.metadata;
        if (metadata) {
            for (const key in metadata) {
                if (!(key in eventProperties)) {
                    eventProperties[key] = metadata[key];
                }
            }
        }

        client.trackEvent({ name: "FeatureEvaluation" }, eventProperties);
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
    properties["TargetingId"] = targetingId?.toString();
    client.trackEvent(event, properties);
}
