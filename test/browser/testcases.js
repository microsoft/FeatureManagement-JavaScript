const ConfigurationObjectFeatureFlagProvider = FeatureManagement.ConfigurationObjectFeatureFlagProvider;
const FeatureManager = FeatureManagement.FeatureManager;

const jsonObject = {
    "feature_management": {
        "feature_flags": [
            {
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
            }
        ]
    }
};

const provider = new ConfigurationObjectFeatureFlagProvider(jsonObject);
const featureManager = new FeatureManager(provider);

describe("feature manager", () => {
    it("should not target user Aiden in default rollout",
        async () => {
            chai.expect(await featureManager.isEnabled("ComplexTargeting", { userId: "Aiden" })).to.eq(false);
        }
    ).timeout(1000);;

    it("should target user Bloosom in default rollout",
        async () => {
            chai.expect(await featureManager.isEnabled("ComplexTargeting", { userId: "Blossom" })).to.eq(true);
        }
    ).timeout(1000);;

    it("should target user Alice",
        async () => {
            chai.expect(await featureManager.isEnabled("ComplexTargeting", { userId: "Alice" })).to.eq(true);
        }
    ).timeout(1000);;

    it("should target user Aiden in group Stage1",
        async () => {
            chai.expect(await featureManager.isEnabled("ComplexTargeting", { userId: "Aiden", groups: ["Stage1"] })).to.eq(true);
        }
    ).timeout(1000);;

    it("should not target user Dave in group Stage1",
        async () => {
            chai.expect(await featureManager.isEnabled("ComplexTargeting", { userId: "Dave", groups: ["Stage1"] })).to.eq(false);
        }
    ).timeout(1000);;

    it("should not target empty user in group Stage2",
        async () => {
            chai.expect(await featureManager.isEnabled("ComplexTargeting", { groups: ["Stage2"] })).to.eq(false);
        }
    ).timeout(1000);;

    it("should target user Aiden in group Stage2",
        async () => {
            chai.expect(await featureManager.isEnabled("ComplexTargeting", { userId: "Aiden", groups: ["Stage2"] })).to.eq(true);
        }
    ).timeout(1000);;

    it("should not target user Chris in group Stage2",
        async () => {
            chai.expect(await featureManager.isEnabled("ComplexTargeting", { userId: "Chris", groups: ["Stage2"] })).to.eq(false);
        }
    ).timeout(1000);;

    it("should not target group Stage3",
        async () => {
            chai.expect(await featureManager.isEnabled("ComplexTargeting", { groups: ["Stage3"] })).to.eq(false);
            chai.expect(await featureManager.isEnabled("ComplexTargeting", { userId: "Alice", groups: ["Stage3"] })).to.eq(false);
            chai.expect(await featureManager.isEnabled("ComplexTargeting", { userId: "Blossom", groups: ["Stage3"] })).to.eq(false);
        }
    ).timeout(1000);
});
