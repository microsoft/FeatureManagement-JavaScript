const ConfigurationObjectFeatureFlagProvider = FeatureManagement.ConfigurationObjectFeatureFlagProvider;
const FeatureManager = FeatureManagement.FeatureManager;

describe("feature manager", () => {
    it("should load from json string",
        async () => {
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
            chai.expect(await featureManager.isEnabled("ComplexTargeting", { userId: "Aiden" })).to.eq(false);
            chai.expect(await featureManager.isEnabled("ComplexTargeting", { userId: "Blossom" })).to.eq(true);
            chai.expect(await featureManager.isEnabled("ComplexTargeting", { userId: "Alice" })).to.eq(true);
            chai.expect(await featureManager.isEnabled("ComplexTargeting", { userId: "Aiden", groups: ["Stage1"] })).to.eq(true);
            chai.expect(await featureManager.isEnabled("ComplexTargeting", { groups: ["Stage2"] })).to.eq(false);
            chai.expect(await featureManager.isEnabled("ComplexTargeting", { userId: "Aiden", groups: ["Stage2"] })).to.eq(true);
            chai.expect(await featureManager.isEnabled("ComplexTargeting", { userId: "Chris", groups: ["Stage2"] })).to.eq(false);
            chai.expect(await featureManager.isEnabled("ComplexTargeting", { groups: ["Stage3"] })).to.eq(false),
            chai.expect(await featureManager.isEnabled("ComplexTargeting", { userId: "Alice", groups: ["Stage3"] })).to.eq(false);
            chai.expect(await featureManager.isEnabled("ComplexTargeting", { userId: "Blossom", groups: ["Stage3"] })).to.eq(false);
            chai.expect(await featureManager.isEnabled("ComplexTargeting", { userId: "Dave", groups: ["Stage1"] })).to.eq(false);
        }
    );
});
