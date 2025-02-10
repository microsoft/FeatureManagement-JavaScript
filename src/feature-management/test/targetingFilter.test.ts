// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import { FeatureManager, ConfigurationMapFeatureFlagProvider } from "../";
chai.use(chaiAsPromised);
const expect = chai.expect;

const complexTargetingFeature = {
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

const createTargetingFeatureWithRolloutPercentage = (name: string, defaultRolloutPercentage: number, groups?: { Name: string, RolloutPercentage: number }[]) => {
    const featureFlag = {
        "id": name,
        "description": "A feature flag using a targeting filter with invalid parameters.",
        "enabled": true,
        "conditions": {
            "client_filters": [
                {
                    "name": "Microsoft.Targeting",
                    "parameters": {
                        "Audience": {
                            "DefaultRolloutPercentage": defaultRolloutPercentage
                        }
                    }
                }
            ]
        }
    };
    if (groups && groups.length > 0) {
        (featureFlag.conditions.client_filters[0].parameters.Audience as any).Groups = groups;
    }
    return featureFlag;
};

describe("targeting filter", () => {
    it("should validate parameters", () => {
        const dataSource = new Map();
        dataSource.set("feature_management", {
            feature_flags: [
                createTargetingFeatureWithRolloutPercentage("InvalidTargeting1", -1),
                createTargetingFeatureWithRolloutPercentage("InvalidTargeting2", 101),
                // invalid group rollout percentage
                createTargetingFeatureWithRolloutPercentage("InvalidTargeting3", 25, [{ Name: "Stage1", RolloutPercentage: -1 }]),
                createTargetingFeatureWithRolloutPercentage("InvalidTargeting4", 25, [{ Name: "Stage1", RolloutPercentage: 101 }]),
            ]
        });

        const provider = new ConfigurationMapFeatureFlagProvider(dataSource);
        const featureManager = new FeatureManager(provider);

        return Promise.all([
            expect(featureManager.isEnabled("InvalidTargeting1", {})).eventually.rejectedWith("Invalid feature flag: InvalidTargeting1. Audience.DefaultRolloutPercentage must be a number between 0 and 100."),
            expect(featureManager.isEnabled("InvalidTargeting2", {})).eventually.rejectedWith("Invalid feature flag: InvalidTargeting2. Audience.DefaultRolloutPercentage must be a number between 0 and 100."),
            expect(featureManager.isEnabled("InvalidTargeting3", {})).eventually.rejectedWith("Invalid feature flag: InvalidTargeting3. RolloutPercentage of group Stage1 must be a number between 0 and 100."),
            expect(featureManager.isEnabled("InvalidTargeting4", {})).eventually.rejectedWith("Invalid feature flag: InvalidTargeting4. RolloutPercentage of group Stage1 must be a number between 0 and 100."),
        ]);
    });

    it("should evaluate feature with targeting filter", () => {
        const dataSource = new Map();
        dataSource.set("feature_management", {
            feature_flags: [complexTargetingFeature]
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
            // - "\nComplexTargeting\nStage2": ~78.7% >= 50% (Stage2 is 50% rollout)
            // - "\nComplexTargeting": ~38.9% >= 25% (default rollout percentage)
            expect(featureManager.isEnabled("ComplexTargeting", { groups: ["Stage2"] })).eventually.eq(false, "Empty user is not in the 50% rollout of group Stage2"),

            // - "Aiden\nComplexTargeting\nStage2": ~15.6%
            expect(featureManager.isEnabled("ComplexTargeting", { userId: "Aiden", groups: ["Stage2"] })).eventually.eq(true, "Aiden is in the 50% rollout of group Stage2"),

            // - "Chris\nComplexTargeting\nStage2": 55.3% >= 50% (Stage2 is 50% rollout)
            // - "Chris\nComplexTargeting": 72.3% >= 25% (default rollout percentage)
            expect(featureManager.isEnabled("ComplexTargeting", { userId: "Chris", groups: ["Stage2"] })).eventually.eq(false, "Chris is not in the 50% rollout of group Stage2"),

            // exclusions
            expect(featureManager.isEnabled("ComplexTargeting", { groups: ["Stage3"] })).eventually.eq(false, "Stage3 group is excluded"),
            expect(featureManager.isEnabled("ComplexTargeting", { userId: "Alice", groups: ["Stage3"] })).eventually.eq(false, "Alice is excluded because she is part of Stage3 group"),
            expect(featureManager.isEnabled("ComplexTargeting", { userId: "Blossom", groups: ["Stage3"] })).eventually.eq(false, "Blossom is excluded because she is part of Stage3 group"),
            expect(featureManager.isEnabled("ComplexTargeting", { userId: "Dave", groups: ["Stage1"] })).eventually.eq(false, "Dave is excluded because he is in the exclusion list"),
        ]);
    });

    it("should evaluate feature with targeting filter with targeting context accessor", async () => {
        const dataSource = new Map();
        dataSource.set("feature_management", {
            feature_flags: [complexTargetingFeature]
        });

        let userId = "";
        let groups: string[] = [];
        const testTargetingContextAccessor = () => ({ userId: userId, groups: groups });
        const provider = new ConfigurationMapFeatureFlagProvider(dataSource);
        const featureManager = new FeatureManager(provider, {targetingContextAccessor: testTargetingContextAccessor});

        userId = "Aiden";
        expect(await featureManager.isEnabled("ComplexTargeting")).to.eq(false);
        userId = "Blossom";
        expect(await featureManager.isEnabled("ComplexTargeting")).to.eq(true);
        expect(await featureManager.isEnabled("ComplexTargeting", {userId: "Aiden"})).to.eq(true); // targeting id will be overridden by the context accessor
        userId = "Aiden";
        groups = ["Stage2"];
        expect(await featureManager.isEnabled("ComplexTargeting")).to.eq(true);
        userId = "Chris";
        expect(await featureManager.isEnabled("ComplexTargeting")).to.eq(false);
    });
});
