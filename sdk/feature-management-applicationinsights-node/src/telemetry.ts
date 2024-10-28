// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { EvaluationResult } from "@microsoft/feature-management";
import { TelemetryClient, Contracts } from "applicationinsights";

/**
 * Creates a telemetry publisher that sends feature evaluation events to Application Insights.
 * @param client The Application Insights telemetry client.
 * @returns A callback function that takes an evaluation result and tracks an event with the evaluation details.
 */
export function createTelemetryPublisher(client: TelemetryClient): (event: EvaluationResult) => void {
    return (event: EvaluationResult) => {
        const eventProperties = {
            "FeatureName": event.feature ? event.feature.id : "",
            "Enabled": event.enabled.toString(),
            // Ensure targetingId is string so that it will be placed in customDimensions
            "TargetingId": event.targetingId ? event.targetingId.toString() : "",
            "Variant": event.variant ? event.variant.name : "",
            "VariantAssignmentReason": event.variantAssignmentReason,
        };

        const metadata = event.feature?.telemetry?.metadata;
        if (metadata) {
            for (const key in metadata) {
                if (!(key in eventProperties)) {
                    eventProperties[key] = metadata[key];
                }
            }
        }

        client.trackEvent({ name: "FeatureEvaluation", properties: eventProperties });
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
 */
export function trackEvent(client: TelemetryClient, targetingId: string, event: Contracts.EventTelemetry): void {
    event.properties = {
        ...event.properties,
        TargetingId: targetingId ? targetingId.toString() : ""
    };
    client.trackEvent(event);
}
