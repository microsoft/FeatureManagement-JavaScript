// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const expect = chai.expect;

import { FeatureManager, ConfigurationObjectFeatureFlagProvider, ConfigurationMapFeatureFlagProvider } from "../";

describe("feature manager", () => {
    it("should load from json string", async () => {
        const jsonObject = {
            "feature_management": {
                "feature_flags": [
                    { "id": "Alpha", "description": "", "enabled": true},
                    { "id": "Beta", "description": "", "enabled": false}
                ]
            }
        };

        const provider = new ConfigurationObjectFeatureFlagProvider(jsonObject);
        const featureManager = new FeatureManager(provider);
        expect(await featureManager.isEnabled("Alpha")).to.eq(true);
        expect(await featureManager.isEnabled("Beta")).to.eq(false);
        expect(await featureManager.isEnabled("not existed")).to.eq(false);

        const featureFlags = await featureManager.listFeatureNames();
        expect(featureFlags.length).to.eq(2);
        expect(featureFlags[0]).to.eq("Alpha");
        expect(featureFlags[1]).to.eq("Beta");
    });

    it("should load from map", async () => {
        const dataSource = new Map();
        dataSource.set("feature_management", {
            feature_flags: [
                { id: "Alpha", enabled: true },
                { id: "Beta", enabled: false}
            ],
        });

        const provider = new ConfigurationMapFeatureFlagProvider(dataSource);
        const featureManager = new FeatureManager(provider);
        expect(await featureManager.isEnabled("Alpha")).to.eq(true);
        expect(await featureManager.isEnabled("Beta")).to.eq(false);
        expect(await featureManager.isEnabled("not existed")).to.eq(false);

        const featureFlags = await featureManager.listFeatureNames();
        expect(featureFlags.length).to.eq(2);
        expect(featureFlags[0]).to.eq("Alpha");
        expect(featureFlags[1]).to.eq("Beta");
    });

    it("should fail when feature flag is invalid", async () => {
        const dataSource = new Map();
        dataSource.set("feature_management", {
            feature_flags: [
                { id: "Alpha", enabled: "true" }
            ],
        });
        const mapProvider = new ConfigurationMapFeatureFlagProvider(dataSource);
        let featureManager = new FeatureManager(mapProvider);
        await expect(featureManager.isEnabled("Alpha")).to.eventually.be.rejectedWith("Invalid feature flag: Alpha. Feature flag 'enabled' must be a boolean.");

        const jsonObject = {
            "feature_management": {
                "feature_flags": [
                    { "id": 123, "enabled": true}
                ]
            }
        };
        const objectProvider = new ConfigurationObjectFeatureFlagProvider(jsonObject);
        featureManager = new FeatureManager(objectProvider);
        await expect(featureManager.listFeatureNames()).to.eventually.be.rejectedWith("Feature flag 'id' must be a string.");
    });

    it("should load latest data if source is updated after initialization", () => {
        const dataSource = new Map();
        dataSource.set("feature_management", {
            feature_flags: [
                { id: "Alpha", enabled: true }
            ],
        });

        const provider = new ConfigurationMapFeatureFlagProvider(dataSource);
        const featureManager = new FeatureManager(provider);
        dataSource.set("feature_management", {
            feature_flags: [
                { id: "Alpha", enabled: false }
            ],
        });

        return expect(featureManager.isEnabled("Alpha")).eventually.eq(false);
    });

    it("should evaluate features without conditions", () => {
        const dataSource = new Map();
        dataSource.set("feature_management", {
            feature_flags: [
                { "id": "Alpha", "description": "", "enabled": true, "conditions": { "client_filters": [] } },
                { "id": "Beta", "description": "", "enabled": false, "conditions": { "client_filters": [] } }
            ],
        });

        const provider = new ConfigurationMapFeatureFlagProvider(dataSource);
        const featureManager = new FeatureManager(provider);
        return Promise.all([
            expect(featureManager.isEnabled("Alpha")).eventually.eq(true),
            expect(featureManager.isEnabled("Beta")).eventually.eq(false)
        ]);
    });

    it("should evaluate features with conditions", () => {
        const dataSource = new Map();
        dataSource.set("feature_management", {
            feature_flags: [
                {
                    "id": "Gamma",
                    "description": "",
                    "enabled": true,
                    "conditions": {
                        "requirement_type": "invalid type",
                        "client_filters": [
                            { "name": "Microsoft.Targeting", "parameters": { "Audience": { "DefaultRolloutPercentage": 50 } } }
                        ]
                    }
                },
                {
                    "id": "Delta",
                    "description": "",
                    "enabled": true,
                    "conditions": {
                        "requirement_type": "Any",
                        "client_filters": [
                            { "name": "Microsoft.Targeting", "parameters": "invalid parameter" }
                        ]
                    }
                }
            ],
        });

        const provider = new ConfigurationMapFeatureFlagProvider(dataSource);
        const featureManager = new FeatureManager(provider);
        return Promise.all([
            expect(featureManager.isEnabled("Gamma")).eventually.rejectedWith("Invalid feature flag: Gamma. 'requirement_type' must be 'Any' or 'All'."),
            expect(featureManager.isEnabled("Delta")).eventually.rejectedWith("Invalid feature flag: Delta. Client filter 'parameters' must be an object.")
        ]);
    });

    it("should let the last feature flag win", () => {
        const jsonObject = {
            "feature_management": {
                "feature_flags": [
                    { "id": "Alpha", "description": "", "enabled": false, "conditions": { "client_filters": [] } },
                    { "id": "Alpha", "description": "", "enabled": true, "conditions": { "client_filters": [] } }
                ]
            }
        };

        const provider1 = new ConfigurationObjectFeatureFlagProvider(jsonObject);
        const featureManager1 = new FeatureManager(provider1);

        const dataSource = new Map();
        dataSource.set("feature_management", {
            feature_flags: [
                { "id": "Alpha", "description": "", "enabled": false, "conditions": { "client_filters": [] } },
                { "id": "Alpha", "description": "", "enabled": true, "conditions": { "client_filters": [] } }
            ],
        });

        const provider2 = new ConfigurationMapFeatureFlagProvider(dataSource);
        const featureManager2 = new FeatureManager(provider2);

        return Promise.all([
            expect(featureManager1.isEnabled("Alpha")).eventually.eq(true),
            expect(featureManager2.isEnabled("Alpha")).eventually.eq(true)
        ]);
    });

    it("should evaluate features with conditions");
    it("should override default filters with custom filters");
});
