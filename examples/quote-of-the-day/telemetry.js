// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

const config = require('./config');
const applicationInsights = require("applicationinsights");
const { createTargetingTelemetryProcessor } = require("@microsoft/feature-management-applicationinsights-node");

// Initialize Application Insights
const initializeAppInsights = (targetingContextAccessor) => {
    applicationInsights.setup(config.appInsightsConnectionString).start();
    
    // Use the targeting telemetry processor to attach targeting id to the telemetry data sent to Application Insights.
    applicationInsights.defaultClient.addTelemetryProcessor(
        createTargetingTelemetryProcessor(targetingContextAccessor)
    );

    return applicationInsights;
};

module.exports = {
    initializeAppInsights
};