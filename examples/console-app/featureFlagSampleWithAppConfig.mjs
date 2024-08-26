// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { load } from "@azure/app-configuration-provider";
import { ConfigurationMapFeatureFlagProvider, FeatureManager } from "@microsoft/feature-management";

const connectionString = "<your-connection-string>";
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

const featureProvider = new ConfigurationMapFeatureFlagProvider(appConfig);
const featureManager = new FeatureManager(featureProvider);

console.log("Feature Beta is:", await featureManager.isEnabled("Beta"));
