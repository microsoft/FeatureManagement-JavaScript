import express from 'express';

const app = express();
const port = 3000;

import * as dotenv from "dotenv";
dotenv.config()

import { load } from "@azure/app-configuration-provider";
const connectionString = process.env.APPCONFIG_CONNECTION_STRING;
const appConfig = await load(connectionString, {
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

import { ConfigurationMapFeatureFlagProvider, FeatureManager } from "@microsoft/feature-management";
const featureProvider = new ConfigurationMapFeatureFlagProvider(appConfig);
const featureManager = new FeatureManager(featureProvider);

app.get('/', (req, res) => {
    res.send('Welcome to the original feature!');
});

app.get('/beta', async (req, res) => {
    appConfig.refresh();
    if (await featureManager.isEnabled("Beta")) {
        res.send('Welcome to the new Beta feature!');
    } else {
        res.status(404).send();
    }
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});