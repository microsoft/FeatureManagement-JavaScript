// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

const { load } = require("@azure/app-configuration-provider");
const { FeatureManager, ConfigurationMapFeatureFlagProvider, ConfigurationObjectFeatureFlagProvider } = require("@microsoft/feature-management");
const { createTelemetryPublisher } = require("@microsoft/feature-management-applicationinsights-node");
const config = require("./config");

// Variables to hold the AppConfig and FeatureManager instances
let appConfig;
let featureManager;

// Initialize AppConfig and FeatureManager
async function initializeFeatureManagement(appInsightsClient, targetingContextAccessor) {
    console.log("Loading configuration...");
    appConfig = await load(config.appConfigConnectionString, {
        featureFlagOptions: {
            enabled: true,
            selectors: [
                {
                    keyFilter: "*"
                }
            ],
            refresh: {
                enabled: true,
                refreshIntervalInMs: 10_000
            }
        }
    });
    const featureFlagProvider = new ConfigurationMapFeatureFlagProvider(appConfig);

    // You can also alternatively use local feature flag source.
    // const featureFlagProvider = new ConfigurationObjectFeatureFlagProvider(config.localFeatureFlags);

    const publishTelemetry = createTelemetryPublisher(appInsightsClient);
    featureManager = new FeatureManager(featureFlagProvider, {
        onFeatureEvaluated: publishTelemetry,
        targetingContextAccessor: targetingContextAccessor
    });

    return { featureManager, appConfig };
}

// Middleware to refresh configuration before each request
const featureFlagRefreshMiddleware = (req, res, next) => {
    // The configuration refresh happens asynchronously to the processing of your app's incoming requests.
    // It will not block or slow down the incoming request that triggered the refresh. 
    // The request that triggered the refresh may not get the updated configuration values, but later requests will get new configuration values.
    appConfig?.refresh(); // intended to not await the refresh
    next();
};

module.exports = {
    initializeFeatureManagement,
    featureFlagRefreshMiddleware
};