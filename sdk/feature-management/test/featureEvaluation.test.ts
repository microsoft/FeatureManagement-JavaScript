// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as chai from "chai";
const expect = chai.expect;

import { FeatureManager, ConfigurationObjectFeatureFlagProvider, EvaluationResult, VariantAssignmentReason } from "../";

let called: boolean = false;
const dummyCallback = () => {
    called = true;
};

let evaluationResult: EvaluationResult | undefined;
const setEvaluationResult = (result: EvaluationResult) => {
    evaluationResult = result;
};

describe("feature evaluation", () => {
    beforeEach(function() {
        evaluationResult = undefined;
    });

    it("should not call onFeatureEvaluated when telemetry is not enabled", async () => {
        const jsonObject = {
            "feature_management": {
                "feature_flags": [
                    {
                        "id": "TestFeature",
                        "enabled": true,
                        "telemetry": { "enabled": false }
                    }
                ]
            }
        };

        const provider = new ConfigurationObjectFeatureFlagProvider(jsonObject);
        const featureManager = new FeatureManager(provider, { onFeatureEvaluated: dummyCallback});

        await featureManager.isEnabled("TestFeature");
        expect(called).to.eq(false);
    });

    it("should not assign variant when there is no variants", async () => {
        const jsonObject = {
            "feature_management": {
                "feature_flags": [
                    {
                        "id": "TestFeature",
                        "enabled": true,
                        "allocation": { "default_when_enabled": "Big" },
                        "telemetry": { "enabled": true}
                    }
                ]
            }
        };

        const provider = new ConfigurationObjectFeatureFlagProvider(jsonObject);
        const featureManager = new FeatureManager(provider, { onFeatureEvaluated: setEvaluationResult});

        await featureManager.isEnabled("TestFeature");
        expect(evaluationResult?.feature?.id).to.eq("TestFeature");
        expect(evaluationResult?.enabled).to.eq(true);
        expect(evaluationResult?.userId).to.eq(undefined);
        expect(evaluationResult?.variant).to.eq(undefined);
        expect(evaluationResult?.variantAssignmentReason).to.eq(VariantAssignmentReason.None);
    });

    it("should assign variant for reason DefaultWhenEnabled", async () => {
        const jsonObject = {
            "feature_management": {
                "feature_flags": [
                    {
                        "id": "TestFeature1",
                        "enabled": true,
                        "variants": [ { "name": "Big", "status_override": "Disabled" }, { "name": "Small" } ],
                        "allocation": {
                            "default_when_enabled": "Big",
                            "user": [ { "variant": "Small", "users": [ "Jeff" ] } ]
                        },
                        "telemetry": { "enabled": true}
                    },
                    {
                        "id": "TestFeature2",
                        "enabled": true,
                        "variants": [ { "name": "Big" } ],
                        "telemetry": { "enabled": true}
                    }
                ]
            }
        };

        const provider = new ConfigurationObjectFeatureFlagProvider(jsonObject);
        const featureManager = new FeatureManager(provider, { onFeatureEvaluated: setEvaluationResult});

        await featureManager.getVariant("TestFeature1", { userId: "Jim" });
        expect(evaluationResult?.feature?.id).to.eq("TestFeature1");
        expect(evaluationResult?.enabled).to.eq(false); // status override
        expect(evaluationResult?.userId).to.eq("Jim");
        expect(evaluationResult?.variant?.name).to.eq("Big");
        expect(evaluationResult?.variantAssignmentReason).to.eq(VariantAssignmentReason.DefaultWhenEnabled);

        await featureManager.getVariant("TestFeature2", { userId: "Jim" });
        expect(evaluationResult?.feature?.id).to.eq("TestFeature2");
        expect(evaluationResult?.enabled).to.eq(true);
        expect(evaluationResult?.userId).to.eq("Jim");
        expect(evaluationResult?.variant).to.eq(undefined);
        expect(evaluationResult?.variantAssignmentReason).to.eq(VariantAssignmentReason.DefaultWhenEnabled);
    });

    it("should assign variant for reason DefaultWhenDisabled", async () => {
        const jsonObject = {
            "feature_management": {
                "feature_flags": [
                    {
                        "id": "TestFeature1",
                        "enabled": false,
                        "variants": [ { "name": "Small", "status_override": "Enabled" }, { "name": "Big" } ],
                        "allocation": {
                            "default_when_disabled": "Small",
                            "user": [ { "variant": "Big", "users": [ "Jeff" ] } ]
                        },
                        "telemetry": { "enabled": true}
                    },
                    {
                        "id": "TestFeature2",
                        "enabled": false,
                        "variants": [ { "name": "Small" } ],
                        "telemetry": { "enabled": true}
                    }
                ]
            }
        };

        const provider = new ConfigurationObjectFeatureFlagProvider(jsonObject);
        const featureManager = new FeatureManager(provider, { onFeatureEvaluated: setEvaluationResult});

        await featureManager.getVariant("TestFeature1", { userId: "Jeff" });
        expect(evaluationResult?.feature?.id).to.eq("TestFeature1");
        expect(evaluationResult?.enabled).to.eq(false); // status oveerride won't work when feature's enabled is false
        expect(evaluationResult?.userId).to.eq("Jeff");
        expect(evaluationResult?.variant?.name).to.eq("Small");
        expect(evaluationResult?.variantAssignmentReason).to.eq(VariantAssignmentReason.DefaultWhenDisabled);

        await featureManager.getVariant("TestFeature2", { userId: "Jeff" });
        expect(evaluationResult?.feature?.id).to.eq("TestFeature2");
        expect(evaluationResult?.enabled).to.eq(false);
        expect(evaluationResult?.userId).to.eq("Jeff");
        expect(evaluationResult?.variant).to.eq(undefined);
        expect(evaluationResult?.variantAssignmentReason).to.eq(VariantAssignmentReason.DefaultWhenDisabled);
    });

    it("should assign variant for reason User", async () => {
        const jsonObject = {
            "feature_management": {
                "feature_flags": [
                    {
                        "id": "TestFeature",
                        "enabled": true,
                        "variants": [ { "name": "Big" } ],
                        "allocation": { "user": [ { "variant": "Big", "users": [ "Jeff" ] } ] },
                        "telemetry": { "enabled": true}
                    }
                ]
            }
        };

        const provider = new ConfigurationObjectFeatureFlagProvider(jsonObject);
        const featureManager = new FeatureManager(provider, { onFeatureEvaluated: setEvaluationResult});

        await featureManager.getVariant("TestFeature", { userId: "Jeff" });
        expect(evaluationResult?.feature?.id).to.eq("TestFeature");
        expect(evaluationResult?.enabled).to.eq(true);
        expect(evaluationResult?.userId).to.eq("Jeff");
        expect(evaluationResult?.variant?.name).to.eq("Big");
        expect(evaluationResult?.variantAssignmentReason).to.eq(VariantAssignmentReason.User);
    });

    it("should assign variant for reason Group", async () => {
        const jsonObject = {
            "feature_management": {
                "feature_flags": [
                    {
                        "id": "TestFeature",
                        "enabled": true,
                        "variants": [ { "name": "Big" } ],
                        "allocation": { "group": [ { "variant": "Big", "groups": [ "admin" ] } ] },
                        "telemetry": { "enabled": true}
                    }
                ]
            }
        };

        const provider = new ConfigurationObjectFeatureFlagProvider(jsonObject);
        const featureManager = new FeatureManager(provider, { onFeatureEvaluated: setEvaluationResult});

        await featureManager.getVariant("TestFeature", { userId: "Jeff", groups: ["admin"] });
        expect(evaluationResult?.feature?.id).to.eq("TestFeature");
        expect(evaluationResult?.enabled).to.eq(true);
        expect(evaluationResult?.userId).to.eq("Jeff");
        expect(evaluationResult?.variant?.name).to.eq("Big");
        expect(evaluationResult?.variantAssignmentReason).to.eq(VariantAssignmentReason.Group);
    });

    it("should assign variant for reason Percentile", async () => {
        const jsonObject = {
            "feature_management": {
                "feature_flags": [
                    {
                        "id": "TestFeature",
                        "enabled": true,
                        "variants": [ { "name": "Big", "status_override": "Disabled" } ],
                        "allocation": { "percentile": [ { "variant": "Big", "from": 0, "to": 50 } ], "seed": "1234" },
                        "telemetry": { "enabled": true}
                    }
                ]
            }
        };

        const provider = new ConfigurationObjectFeatureFlagProvider(jsonObject);
        const featureManager = new FeatureManager(provider, { onFeatureEvaluated: setEvaluationResult});

        await featureManager.getVariant("TestFeature", { userId: "Marsha" });
        expect(evaluationResult?.feature?.id).to.eq("TestFeature");
        expect(evaluationResult?.enabled).to.eq(false); // status override
        expect(evaluationResult?.userId).to.eq("Marsha");
        expect(evaluationResult?.variant?.name).to.eq("Big");
        expect(evaluationResult?.variantAssignmentReason).to.eq(VariantAssignmentReason.Percentile);
    });
});
