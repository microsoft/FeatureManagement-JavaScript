// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

require("dotenv").config();

// Export configuration variables
module.exports = {
    appConfigConnectionString: process.env.APPCONFIG_CONNECTION_STRING,
    appInsightsConnectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
    port: process.env.PORT || "8080"
};