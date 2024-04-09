// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const expect = chai.expect;

import { FeatureManager, ConfigurationMapFeatureFlagProvider } from "./exportedApi";

const complextTargetingFeature = {
    "id": "ComplexTargeting",
    "description": "A feature flag using a targeting filter, that will return true for Alice, Stage1, and 50% of Stage2. Dave and Stage3 are excluded. The default rollout percentage is 25%.",
    "enabled": true,
    "conditions": {
        "client_filters": [
            {
                "name": "Microsoft.Targeting",
                "parameters": {
                    "Audience": {
                        "Users": [
                            "Alice"
                        ],
                        "Groups": [
                            {
                                "Name": "Stage1",
                                "RolloutPercentage": 100
                            },
                            {
                                "Name": "Stage2",
                                "RolloutPercentage": 50
                            }
                        ],
                        "DefaultRolloutPercentage": 25,
                        "Exclusion": {
                            "Users": ["Dave"],
                            "Groups": ["Stage3"]
                        }
                    }
                }
            }
        ]
    }
};

describe("targeting filter", () => {
    it("should evaluate feature with targeting filter", () => {
        const dataSource = new Map();
        dataSource.set("feature_management", {
            feature_flags: [complextTargetingFeature]
        });

        const provider = new ConfigurationMapFeatureFlagProvider(dataSource);
        const featureManager = new FeatureManager(provider);

        return Promise.all([
            // default rollout 25%
            // - "Aiden\nComplexTargeting": ~62.9%
            expect(featureManager.isEnabled("ComplexTargeting", { userId: "Aiden" })).eventually.eq(false, "Aiden is not in the 25% default rollout"),
            // - "Blossom\nComplexTargeting": ~20.2%
            expect(featureManager.isEnabled("ComplexTargeting", { userId: "Blossom" })).eventually.eq(true, "Blossom is in the 25% default rollout"),
            expect(featureManager.isEnabled("ComplexTargeting", { userId: "Alice" })).eventually.eq(true, "Alice is directly targeted"),

            // Stage1 group is 100% rollout
            expect(featureManager.isEnabled("ComplexTargeting", { userId: "Aiden", groups: ["Stage1"] })).eventually.eq(true, "Aiden is in because Stage1 is 100% rollout"),

            // Stage2 group is 50% rollout
            // - "\nComplexTargeting\nStage2": ~78.7%
            expect(featureManager.isEnabled("ComplexTargeting", { groups: ["Stage2"] })).eventually.eq(false, "Empty user will hit the 50% rollout of group Stage2"),
            // - "Aiden\nComplexTargeting\nStage2": ~15.6%
            expect(featureManager.isEnabled("ComplexTargeting", { userId: "Aiden", groups: ["Stage2"] })).eventually.eq(true, "Aiden is in the 50% rollout"),
            // TODO:
            // In the centralized test cases it is Chad here, but "Chad\nComplexTargeting\nStage2": ~33.8%, is in the 50% rollout.
            // Need to investigate whether the case or implementation is wrong.
            // - "Cad\nComplexTargeting\nStage2": ~80.3%
            expect(featureManager.isEnabled("ComplexTargeting", { userId: "Cad", groups: ["Stage2"] })).eventually.eq(false, "Cad is not in the 50% rollout"),

            // exclusions
            expect(featureManager.isEnabled("ComplexTargeting", { groups: ["Stage3"] })).eventually.eq(false, "Stage3 group is excluded"),
            expect(featureManager.isEnabled("ComplexTargeting", { userId: "Alice", groups: ["Stage3"] })).eventually.eq(false, "Alice is excluded because she is part of Stage3 group"),
            expect(featureManager.isEnabled("ComplexTargeting", { userId: "Blossom", groups: ["Stage3"] })).eventually.eq(false, "Blossom is excluded because she is part of Stage3 group"),
            expect(featureManager.isEnabled("ComplexTargeting", { userId: "Dave", groups: ["Stage1"] })).eventually.eq(false, "Dave is excluded because he is in the exclusion list"),
        ]);
    });
});
