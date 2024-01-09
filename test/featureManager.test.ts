// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as chai from "chai";
const expect = chai.expect;

import { FeatureManager } from "./exportedApi";

describe("feature manager", () => {
    it("should load from json string", () => {
        const json = `{
            "FeatureManagement": {
                "FeatureFlags": [
                    { "id": "Alpha", "description": "", "enabled": true}
                ]
            }
        }`;

        const featureManager = new FeatureManager(json);
        expect(featureManager.isEnabled("Alpha")).eq(true);
    });

    it("should load from map", () => {
        const dataSource = new Map();
        dataSource.set("FeatureManagement", {
            FeatureFlags: [
                { id: "Alpha", enabled: true }
            ],
        });

        const featureManager = new FeatureManager(dataSource);
        expect(featureManager.isEnabled("Alpha")).eq(true);
    });

    it("shoud evaluate features without conditions", () => {
        const dataSource = new Map();
        dataSource.set("FeatureManagement", {
            FeatureFlags: [
                { "id": "Alpha", "description": "", "enabled": true, "conditions": { "client_filters": [] } },
                { "id": "Beta", "description": "", "enabled": false, "conditions": { "client_filters": [] } }
            ],
        });

        const featureManager = new FeatureManager(dataSource);
        expect(featureManager.isEnabled("Alpha")).eq(true);
        expect(featureManager.isEnabled("Beta")).eq(false);
    });

    it("shoud evaluate features with conditions");
    it("shoud override default filters with custom filters");
});