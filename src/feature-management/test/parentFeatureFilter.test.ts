// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { FeatureManager, ConfigurationMapFeatureFlagProvider } from "../src/index.js";
chai.use(chaiAsPromised);
const expect = chai.expect;

describe("parent feature filter", () => {
    it("should evaluate feature with parent feature filter enabled", async () => {
        const config = {
            "feature_management": {
                "feature_flags": [
                    {
                        "id": "FeatureA",
                        "enabled": true,
                        "conditions": {
                            "client_filters": [
                                {
                                    "name": "Microsoft.ParentFeature",
                                    "parameters": {
                                        "Name": "FeatureB"
                                    }
                                }
                            ]
                        }
                    },
                    {
                        "id": "FeatureB",
                        "enabled": true
                    }
                ]
            }
        };

        const dataSource = new Map();
        dataSource.set("feature_management", config.feature_management);
        const provider = new ConfigurationMapFeatureFlagProvider(dataSource);
        const featureManager = new FeatureManager(provider);

        const result = await featureManager.isEnabled("FeatureA");
        expect(result).to.equal(true);
    });

    it("should evaluate feature with parent feature filter disabled", async () => {
        const config = {
            "feature_management": {
                "feature_flags": [
                    {
                        "id": "FeatureA",
                        "enabled": true,
                        "conditions": {
                            "client_filters": [
                                {
                                    "name": "ParentFeature",
                                    "parameters": {
                                        "Name": "FeatureB"
                                    }
                                }
                            ]
                        }
                    },
                    {
                        "id": "FeatureB",
                        "enabled": false
                    }
                ]
            }
        };

        const dataSource = new Map();
        dataSource.set("feature_management", config.feature_management);
        const provider = new ConfigurationMapFeatureFlagProvider(dataSource);
        const featureManager = new FeatureManager(provider);

        const result = await featureManager.isEnabled("FeatureA");
        expect(result).to.equal(false);
    });
});
