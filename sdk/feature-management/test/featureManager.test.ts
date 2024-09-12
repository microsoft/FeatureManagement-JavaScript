// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const expect = chai.expect;

import { FeatureManager, ConfigurationObjectFeatureFlagProvider, ConfigurationMapFeatureFlagProvider } from "../";

describe("feature manager", () => {
    it("should load from json string", () => {
        const jsonObject = {
            "feature_management": {
                "feature_flags": [
                    { "id": "Alpha", "description": "", "enabled": true}
                ]
            }
        };

        const provider = new ConfigurationObjectFeatureFlagProvider(jsonObject);
        const featureManager = new FeatureManager(provider);
        return expect(featureManager.isEnabled("Alpha")).eventually.eq(true);
    });

    it("should load from map", () => {
        const dataSource = new Map();
        dataSource.set("feature_management", {
            feature_flags: [
                { id: "Alpha", enabled: true }
            ],
        });

        const provider = new ConfigurationMapFeatureFlagProvider(dataSource);
        const featureManager = new FeatureManager(provider);
        return expect(featureManager.isEnabled("Alpha")).eventually.eq(true);
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

    it("should evaluate features with conditions");
    it("should override default filters with custom filters");
});
