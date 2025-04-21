// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { EvaluationResult, createFeatureEvaluationEventProperties, ITargetingContextAccessor } from "@microsoft/feature-management";
import { TelemetryClient, Contracts } from "applicationinsights";

const TARGETING_ID = "TargetingId";
const FEATURE_EVALUATION_EVENT_NAME = "FeatureEvaluation";

/**
 * Creates a telemetry publisher that sends feature evaluation events to Application Insights.
 * @param client The Application Insights telemetry client.
 * @returns A callback function that takes an evaluation result and tracks an event with the evaluation details.
 */
export function createTelemetryPublisher(client: TelemetryClient): (result: EvaluationResult) => void {
    return (result: EvaluationResult) => {
        if (result.feature === undefined) {
            return;
        }

        const eventProperties = createFeatureEvaluationEventProperties(result);
        client.trackEvent({ name: FEATURE_EVALUATION_EVENT_NAME, properties: eventProperties });
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
        [TARGETING_ID]: targetingId ? targetingId.toString() : ""
    };
    client.trackEvent(event);
}

/**
 * Creates a telemetry processor that adds targeting id to telemetry envelope's custom properties.
 * @param targetingContextAccessor The accessor function to get the targeting context.
 * @returns A telemetry processor that attaches targeting id to telemetry envelopes.
 */
export function createTargetingTelemetryProcessor(targetingContextAccessor: ITargetingContextAccessor): (envelope: Contracts.EnvelopeTelemetry) => boolean {
    return (envelope: Contracts.EnvelopeTelemetry) => {
        const targetingContext = targetingContextAccessor.getTargetingContext();
        if (targetingContext?.userId === undefined) {
            console.warn("Targeting id is undefined.");
        }
        envelope.data.baseData = envelope.data.baseData || {};
        envelope.data.baseData.properties = {...envelope.data.baseData.properties, [TARGETING_ID]: targetingContext?.userId || ""};
        return true; // If a telemetry processor returns false, that telemetry item isn't sent.
    };
}
