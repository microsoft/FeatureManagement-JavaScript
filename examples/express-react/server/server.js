// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import express from "express";
import cors from "cors";
import { load } from "@azure/app-configuration-provider";
import { ConfigurationMapFeatureFlagProvider, FeatureManager } from "@microsoft/feature-management";

const app = express();
const port = 5000;

const corsOptions = {
    origin: ["http://localhost:4173", "http://localhost:5173"] // vite will run the web app on port 4173 and 5173
}
app.use(cors(corsOptions))

const connectionString = "<your-connection-string>";
const appConfig = await load(connectionString, {
    refreshOptions: {
        enabled: true,
        refreshIntervalInMs: 10_000,
        watchedSettings: [{ key: "fontColor" }] // Watch for changes to the key "sentinel" and refreshes the configuration when it changes
    },
    featureFlagOptions: {
        enabled: true,
        selectors: [{
            keyFilter: "*"
        }],
        refresh: {
            enabled: true,
            refreshIntervalInMs: 10_000
        }
    }
});

const featureProvider = new ConfigurationMapFeatureFlagProvider(appConfig);
const featureManager = new FeatureManager(featureProvider);

app.get('/beta', async (req, res) => {
    appConfig.refresh();
    if (await featureManager.isEnabled("Beta")) {
        res.send('Welcome to the new Beta feature!');
    } else {
        res.status(404).send();
    }
});

app.get("/config", (req, res) => {
    appConfig.refresh();
    res.json(appConfig.constructConfigurationObject());
})


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});