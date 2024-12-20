// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import { FeatureManager, ConfigurationObjectFeatureFlagProvider } from "../src/index.js";
import { Features, featureFlagsConfigurationObject } from "./sampleFeatureFlags.js";
chai.use(chaiAsPromised);
const expect = chai.expect;

describe("feature variant", () => {

    let featureManager: FeatureManager;

    before(() => {
        const provider = new ConfigurationObjectFeatureFlagProvider(featureFlagsConfigurationObject);
        featureManager = new FeatureManager(provider);
    });

    describe("valid scenarios", () => {
        const context = { userId: "Marsha", groups: ["Group1"] };

        it("default allocation with disabled feature", async () => {
            const variant = await featureManager.getVariant(Features.VariantFeatureDefaultDisabled, context);
            expect(variant).not.to.be.undefined;
            expect(variant?.name).eq("Small");
            expect(variant?.configuration).eq("300px");
        });

        it("default allocation with enabled feature", async () => {
            const variant = await featureManager.getVariant(Features.VariantFeatureDefaultEnabled, context);
            expect(variant).not.to.be.undefined;
            expect(variant?.name).eq("Medium");
            expect(variant?.configuration).deep.eq({ Size: "450px", Color: "Purple" });
        });

        it("user allocation", async () => {
            const variant = await featureManager.getVariant(Features.VariantFeatureUser, context);
            expect(variant).not.to.be.undefined;
            expect(variant?.name).eq("Small");
            expect(variant?.configuration).eq("300px");
        });

        it("group allocation", async () => {
            const variant = await featureManager.getVariant(Features.VariantFeatureGroup, context);
            expect(variant).not.to.be.undefined;
            expect(variant?.name).eq("Small");
            expect(variant?.configuration).eq("300px");
        });

        it("percentile allocation with seed", async () => {
            const variant = await featureManager.getVariant(Features.VariantFeaturePercentileOn, context);
            expect(variant).not.to.be.undefined;
            expect(variant?.name).eq("Big");

            const variant2 = await featureManager.getVariant(Features.VariantFeaturePercentileOff, context);
            expect(variant2).to.be.undefined;
        });

        it("overwrite enabled status", async () => {
            const enabledStatus = await featureManager.isEnabled(Features.VariantFeaturePercentileOn, context);
            expect(enabledStatus).to.be.false; // featureFlag.enabled = true, overridden to false by variant `Big`.
        });

    });

    describe("invalid scenarios", () => {
        const context = { userId: "Jeff" };

        it("return undefined when no variants are specified", async () => {
            const variant = await featureManager.getVariant(Features.VariantFeatureNoVariants, context);
            expect(variant).to.be.undefined;
        });

        it("return undefined when no allocation is specified", async () => {
            const variant = await featureManager.getVariant(Features.VariantFeatureNoAllocation, context);
            expect(variant).to.be.undefined;
        });

        it("only support configuration value", async () => {
            const variant = await featureManager.getVariant(Features.VariantFeatureBothConfigurations, context);
            expect(variant).not.to.be.undefined;
            expect(variant?.configuration).eq("600px");
        });

        // requires IFeatureFlagProvider to throw an exception on validation
        it("throw exception for invalid StatusOverride value");

        // requires IFeatureFlagProvider to throw an exception on validation
        it("throw exception for invalid doubles From and To in the Percentile section");

    });

});
