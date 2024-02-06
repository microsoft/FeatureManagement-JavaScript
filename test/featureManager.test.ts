// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const expect = chai.expect;

import { FeatureManager, ConfigurationFeatureProvider } from "./exportedApi";

describe("feature manager", () => {
    it("should load from json string", () => {
        const jsonObject = {
            "FeatureManagement": {
                "FeatureFlags": [
                    { "id": "Alpha", "description": "", "enabled": true}
                ]
            }
        };

        const provider = new ConfigurationFeatureProvider(jsonObject);
        const featureManager = new FeatureManager(provider);
        return expect(featureManager.isEnabled("Alpha")).eventually.eq(true);
    });

    it("should load from map", () => {
        const dataSource = new Map();
        dataSource.set("FeatureManagement", {
            FeatureFlags: [
                { id: "Alpha", enabled: true }
            ],
        });

        const provider = new ConfigurationFeatureProvider(dataSource);
        const featureManager = new FeatureManager(provider);
        return expect(featureManager.isEnabled("Alpha")).eventually.eq(true);
    });

    it("shoud evaluate features without conditions", () => {
        const dataSource = new Map();
        dataSource.set("FeatureManagement", {
            FeatureFlags: [
                { "id": "Alpha", "description": "", "enabled": true, "conditions": { "client_filters": [] } },
                { "id": "Beta", "description": "", "enabled": false, "conditions": { "client_filters": [] } }
            ],
        });

        const provider = new ConfigurationFeatureProvider(dataSource);
        const featureManager = new FeatureManager(provider);
        return Promise.all([
            expect(featureManager.isEnabled("Alpha")).eventually.eq(true),
            expect(featureManager.isEnabled("Beta")).eventually.eq(false)
        ]);
    });

    it("shoud evaluate features with conditions");
    it("shoud override default filters with custom filters");
});