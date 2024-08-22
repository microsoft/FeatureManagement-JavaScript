const ConfigurationObjectFeatureFlagProvider = FeatureManagement.ConfigurationObjectFeatureFlagProvider;
const FeatureManager = FeatureManagement.FeatureManager;

describe("feature manager", () => {
    it("should load from json string",
        async () => {
            const jsonObject = {
                "feature_management": {
                    "feature_flags": [
                        { "id": "Alpha", "description": "", "enabled": true }
                    ]
                }
            };
            const provider = new ConfigurationObjectFeatureFlagProvider(jsonObject);
            const featureManager = new FeatureManager(provider);
            return chai.expect(await featureManager.isEnabled("Alpha")).to.eq(true);
        }
    );
});
