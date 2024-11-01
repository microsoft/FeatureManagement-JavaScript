// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { EvaluationResult, createFeatureEvaluationEventProperties } from "@microsoft/feature-management";
import { ApplicationInsights, IEventTelemetry } from "@microsoft/applicationinsights-web";

const TARGETING_ID = "TargetingId";
const FEATURE_EVALUATION_EVENT_NAME = "FeatureEvaluation";

/**
 * Creates a telemetry publisher that sends feature evaluation events to Application Insights.
 * @param client The Application Insights telemetry client.
 * @returns A callback function that takes an evaluation result and tracks an event with the evaluation details.
 */
export function createTelemetryPublisher(client: ApplicationInsights): (result: EvaluationResult) => void {
    return (result: EvaluationResult) => {
        if (result.feature === undefined) {
            return;
        }

        const eventProperties = createFeatureEvaluationEventProperties(result);

        const metadata = result.feature.telemetry?.metadata;
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
