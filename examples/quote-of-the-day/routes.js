// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

const express = require("express");
const router = express.Router();

// Initialize routes with dependencies
function initializeRoutes(featureManager, appInsightsClient) {
    // API route to get greeting message with feature variants
    router.get("/api/getGreetingMessage", async (req, res) => {
        const variant = await featureManager.getVariant("Greeting");
        res.status(200).send({
            message: variant?.configuration
        });
    });

    // API route to track likes
    router.post("/api/like", (req, res) => {
        const { userId } = req.body;
        if (userId === undefined) {
            return res.status(400).send({ error: "UserId is required" });
        }
        appInsightsClient.trackEvent({ name: "Like" });
        res.status(200).send({ message: "Like event logged successfully" });
    });

    return router;
}

module.exports = { initializeRoutes };