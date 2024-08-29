// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { load } from "@azure/app-configuration-provider";
import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
dotenv.config()
const connectionString = process.env.APPCONFIG_CONNECTION_STRING;

const app = express();
const port = 5000;

const corsOptions = {
    origin: ["http://localhost:4173", "http://localhost:5173"] // vite will run the web app on port 4173 and 5173
}
app.use(cors(corsOptions))

const appConfig = await load(connectionString, {
    selectors: [{
        keyFilter: "app.*"
    }],
    refreshOptions: {
        enabled: true,
        refreshIntervalInMs: 10_000,
        watchedSettings: [{ key: "sentinel" }]
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

app.get("/config", (req, res) => {
    appConfig.refresh();
    res.json(appConfig.constructConfigurationObject());
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});