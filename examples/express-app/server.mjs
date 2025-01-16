import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from 'node:fs/promises';

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

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pageDir = path.join(__dirname, "pages");

app.get("/", (req, res) => {
    appConfig.refresh();
    res.sendFile(path.join(pageDir, "index.html"));
});

app.get("/Beta", async (req, res) => {
    appConfig.refresh();
    const { userId, groups } = req.query;

    if (await featureManager.isEnabled("Beta", { userId: userId, groups: groups ? groups.split(",") : [] })) {
        res.sendFile(path.join(pageDir, "beta.html"));
    } else {
        res.status(404).send("Page not found");
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});