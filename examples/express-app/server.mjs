import express from "express";
import path from "path";

import { load } from "@azure/app-configuration-provider";
const connectionString = "<your-connection-string>";;
const appConfig = await load(connectionString, {
    featureFlagOptions: {
        enabled: true,
        selectors: [{
            keyFilter: "*"
        }],
        refresh: {
            enabled: true
        }
    }
});

appConfig.onRefresh(() => {
    console.log("Configuration has been refreshed.");
});

import { ConfigurationObjectFeatureFlagProvider, ConfigurationMapFeatureFlagProvider, FeatureManager } from "@microsoft/feature-management";

/*
You can use either ConfigurationObjectFeatureFlagProvider or ConfigurationMapFeatureFlagProvider to provide feature flags.
We recommend using Azure App Configuration as the source of feature flags.
*/
// const config = JSON.parse(await fs.readFile("config.json"));
// const featureProvider = new ConfigurationObjectFeatureFlagProvider(config);

const featureProvider = new ConfigurationMapFeatureFlagProvider(appConfig);
const featureManager = new FeatureManager(featureProvider);

const server = express();
const PORT = 3000;

// Use a middleware to achieve request-driven configuration refresh
server.use((req, res, next) => {
    // this call s not blocking, the configuration will be updated asynchronously
    appConfig.refresh();
    next();
})


server.get("/", (req, res) => {
    appConfig.refresh();
    res.send("Hello World!");
});

server.get("/Beta", async (req, res) => {
    appConfig.refresh();
    const { userId, groups } = req.query;

    if (await featureManager.isEnabled("Beta", { userId: userId, groups: groups ? groups.split(",") : [] })) {
        res.send("Welcome to the Beta page!");
    } else {
        res.status(404).send("Page not found");
    }
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});