// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

require("dotenv").config();

const fs = require('fs/promises');
const localFeatureFlags = JSON.parse(await fs.readFile("localFeatureFlags.json"));

// Export configuration variables
module.exports = {
    localFeatureFlags,
    appConfigConnectionString: process.env.APPCONFIG_CONNECTION_STRING,
    appInsightsConnectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
    port: process.env.PORT || "8080"
};