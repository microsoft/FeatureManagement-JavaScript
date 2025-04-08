// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import fs from "fs/promises";
import { ConfigurationObjectFeatureFlagProvider, FeatureManager } from "@microsoft/feature-management";
// You can also use Azure App Configuration as the source of feature flags.
// For more information, please go to quickstart: https://learn.microsoft.com/azure/azure-app-configuration/quickstart-feature-flag-javascript

const config = JSON.parse(await fs.readFile("config.json"));
const featureProvider = new ConfigurationObjectFeatureFlagProvider(config);

// https://nodejs.org/api/async_context.html
import { AsyncLocalStorage } from "async_hooks";
const requestAccessor = new AsyncLocalStorage();
const exampleTargetingContextAccessor = {
    getTargetingContext: () => {
        const req = requestAccessor.getStore();
        // read user and groups from request query data
        const { userId, groups } = req.query;
        // return an ITargetingContext with the appropriate user info
        return { userId: userId, groups: groups ? groups.split(",") : [] };
    }
};

const featureManager = new FeatureManager(
    featureProvider, 
    { 
        targetingContextAccessor: exampleTargetingContextAccessor 
    }
);

import express from "express";
const server = express();
const PORT = 3000;

// Use a middleware to store the request object in async local storage.
// The async local storage allows the targeting context accessor to access the current request throughout its lifetime.
// Middleware 1 (request object is stored in async local storage here and it will be available across the following chained async operations)
//   Middleware 2
//     Request Handler (feature flag evaluation happens here)
server.use((req, res, next) => {
    requestAccessor.run(req, next);
});

server.get("/", (req, res) => {
    res.send("Hello World!");
});

server.get("/Beta", async (req, res) => {
    if (await featureManager.isEnabled("Beta")) {
        res.send("Welcome to the Beta page!");
    } else {
        res.status(404).send("Page not found");
    }
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});