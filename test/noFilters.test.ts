// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const expect = chai.expect;

import { FeatureManager, ConfigurationObjectFeatureFlagProvider } from "./exportedApi";

const featureFlagsDataObject = {
    "feature_management": {
        "feature_flags": [
            {
                "id": "BooleanTrue",
                "description": "A feature flag with no Filters, that returns true.",
                "enabled": true,
                "conditions": {
                    "client_filters": []
                }
            },
            {
                "id": "BooleanFalse",
                "description": "A feature flag with no Filters, that returns false.",
                "enabled": false,
                "conditions": {
                    "client_filters": []
                }
            },
            {
                "id": "InvalidEnabled",
                "description": "A feature flag with an invalid 'enabled' value, that returns false.",
                "enabled": "invalid",
                "conditions": {
                    "client_filters": []
                }
            },
            {
                "id": "Minimal",
                "enabled": true
            },
            {
                "id": "NoEnabled"
            },
            {
                "id": "EmptyConditions",
                "description": "A feature flag with no values in conditions, that returns true.",
                "enabled": true,
                "conditions": {
                }
            }
        ]
    }
};

describe("feature flags with no filters", () => {
    it("should validate feature flags without filters", () => {
        const provider = new ConfigurationObjectFeatureFlagProvider(featureFlagsDataObject);
        const featureManager = new FeatureManager(provider);

        return Promise.all([
            expect(featureManager.isEnabled("BooleanTrue")).eventually.eq(true),
            expect(featureManager.isEnabled("BooleanFalse")).eventually.eq(false),
            expect(featureManager.isEnabled("InvalidEnabled")).eventually.eq(false),
            expect(featureManager.isEnabled("Minimal")).eventually.eq(true),
            expect(featureManager.isEnabled("NoEnabled")).eventually.eq(false),
            expect(featureManager.isEnabled("EmptyConditions")).eventually.eq(true)
        ]);
    });
});
