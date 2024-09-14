// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { EvaluationResult } from "@microsoft/feature-management";
import { ApplicationInsights } from "@microsoft/applicationinsights-web";
import { IEventTelemetry } from "@microsoft/applicationinsights-web";

/**
 * Creates a telemetry publisher that sends feature evaluation events to Application Insights.
 * @param client The Application Insights telemetry client.
 * @returns A callback function that takes an evaluation result and tracks an event with the evaluation details.
 */
export function createTelemetryPublisher(client: ApplicationInsights): (event: EvaluationResult) => void {
    return (event: EvaluationResult) => {
        client.trackEvent(
            {
                name: "FeatureEvaluation"
            },
            {
                "FeatureName": event.feature?.id,
                "Enabled": event.enabled.toString(),
                "TargetingId": event.targetingId,
                "Variant": event.variant?.name,
                "VariantAssignmentReason": event.variantAssignmentReason,
            });
    };
}

/**
 * Tracks a custom event using Application Insights, ensuring that the "TargetingId"
 * is included in the custom properties. If the "TargetingId" already exists in
 * the provided custom properties, it will not be overwritten.
 *
 * @param client The Application Insights client instance used to track the event.
 * @param targetingId The unique targeting identifier that will be included in the custom properties.
 * @param event The event telemetry object to be tracked, containing event details.
 * @param customProperties (Optional) Additional properties to include in the event telemetry.
 */
export function trackEvent(client: ApplicationInsights, targetingId: string, event: IEventTelemetry, customProperties?: {[key: string]: any}): void {
    const properties = customProperties ? { ...customProperties } : {};
    properties["TargetingId"] = targetingId;

    client.trackEvent(event, properties);
}
