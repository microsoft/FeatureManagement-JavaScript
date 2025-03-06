// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import { FeatureManager, ConfigurationObjectFeatureFlagProvider } from "../";
import { Features, featureFlagsConfigurationObject } from "./sampleVariantFeatureFlags.js";
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

        it("should perform default allocation with disabled feature", async () => {
            const variant = await featureManager.getVariant(Features.VariantFeatureDefaultDisabled, context);
            expect(variant).not.to.be.undefined;
            expect(variant?.name).eq("Small");
            expect(variant?.configuration).eq("300px");
        });

        it("should perform default allocation with enabled feature", async () => {
            const variant = await featureManager.getVariant(Features.VariantFeatureDefaultEnabled, context);
            expect(variant).not.to.be.undefined;
            expect(variant?.name).eq("Medium");
            expect(variant?.configuration).deep.eq({ Size: "450px", Color: "Purple" });
        });

        it("should perform user allocation", async () => {
            const variant = await featureManager.getVariant(Features.VariantFeatureUser, context);
            expect(variant).not.to.be.undefined;
            expect(variant?.name).eq("Small");
            expect(variant?.configuration).eq("300px");
        });

        it("should perform group allocation", async () => {
            const variant = await featureManager.getVariant(Features.VariantFeatureGroup, context);
            expect(variant).not.to.be.undefined;
            expect(variant?.name).eq("Small");
            expect(variant?.configuration).eq("300px");
        });

        it("should perform percentile allocation with seed", async () => {
            const variant = await featureManager.getVariant(Features.VariantFeaturePercentileOn, context);
            expect(variant).not.to.be.undefined;
            expect(variant?.name).eq("Big");

            const variant2 = await featureManager.getVariant(Features.VariantFeaturePercentileOff, context);
            expect(variant2).to.be.undefined;
        });

        it("should overwrite enabled status", async () => {
            const enabledStatus = await featureManager.isEnabled(Features.VariantFeaturePercentileOn, context);
            expect(enabledStatus).to.be.false; // featureFlag.enabled = true, overridden to false by variant `Big`.
        });

    });

    describe("invalid scenarios", () => {
        const context = { userId: "Jeff" };

        it("should return undefined when no variants are specified", async () => {
            const variant = await featureManager.getVariant(Features.VariantFeatureNoVariants, context);
            expect(variant).to.be.undefined;
        });

        it("should return undefined when no allocation is specified", async () => {
            const variant = await featureManager.getVariant(Features.VariantFeatureNoAllocation, context);
            expect(variant).to.be.undefined;
        });

        // requires IFeatureFlagProvider to throw an exception on validation
        it("should throw exception for invalid StatusOverride value", async () => {
            await expect(featureManager.getVariant(Features.VariantFeatureInvalidStatusOverride, context))
                .eventually.rejectedWith("Invalid feature flag: VariantFeatureInvalidStatusOverride. Variant 'status_override' must be 'None', 'Enabled', or 'Disabled'.");
        });

        // requires IFeatureFlagProvider to throw an exception on validation
        it("should throw exception for invalid doubles From and To in the Percentile section", async () => {
            await expect(featureManager.getVariant(Features.VariantFeatureInvalidFromTo, context))
                .eventually.rejectedWith("Invalid feature flag: VariantFeatureInvalidFromTo. Percentile allocation 'from' must be a number between 0 and 100.");
        });

    });

});
