// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

const config = require("./config");

const express = require("express");
const { targetingContextAccessor, requestStorageMiddleware } = require("./targetingContextAccessor");
const { initializeAppInsights } = require("./telemetry");
const { initializeFeatureManagement, featureFlagRefreshMiddleware } = require("./featureManagement");
const { initializeRoutes } = require("./routes");

// Initialize Express server
const server = express();

// Initialize Application Insights
const appInsights = initializeAppInsights(targetingContextAccessor);

// Global variables to store feature manager and app config
let featureManager;

// Initialize the configuration and start the server
async function startApp() {
    try {
        // Initialize AppConfig and FeatureManager
        const result = await initializeFeatureManagement(
            appInsights.defaultClient, 
            targetingContextAccessor
        );
        featureManager = result.featureManager;

        console.log("Configuration loaded. Starting server...");
        
        // Set up middleware
        server.use(requestStorageMiddleware);
        server.use(featureFlagRefreshMiddleware);
        server.use(express.json());
        server.use(express.static("public"));
        
        // Set up routes
        const routes = initializeRoutes(featureManager, appInsights.defaultClient);
        server.use(routes);

        // Start the server
        server.listen(config.port, () => {
            console.log(`Server is running at http://localhost:${config.port}`);
        });
    } catch (error) {
        console.error("Failed to load configuration:", error);
        process.exit(1);
    }
}

// Start the application
startApp();
