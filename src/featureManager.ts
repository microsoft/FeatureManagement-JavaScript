// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { TimeWindowFilter } from "./filter/TimeWindowFilter";
import { IFeatureFilter } from "./filter/FeatureFilter";
import { FeatureFlag, RequirementType, VariantDefinition } from "./model";
import { IFeatureFlagProvider } from "./featureProvider";
import { TargetingFilter } from "./filter/TargetingFilter";
import { Variant } from "./variant/Variant";
import { IFeatureManager } from "./IFeatureManager";
import { ITargetingContext } from "./common/ITargetingContext";
import { isTargetedGroup, isTargetedPercentile, isTargetedUser } from "./common/targetingEvaluator";

export class FeatureManager implements IFeatureManager {
    #provider: IFeatureFlagProvider;
    #featureFilters: Map<string, IFeatureFilter> = new Map();

    constructor(provider: IFeatureFlagProvider, options?: FeatureManagerOptions) {
        this.#provider = provider;

        const builtinFilters = [new TimeWindowFilter(), new TargetingFilter()];

        // If a custom filter shares a name with an existing filter, the custom filter overrides the existing one.
        for (const filter of [...builtinFilters, ...(options?.customFilters ?? [])]) {
            this.#featureFilters.set(filter.name, filter);
        }
    }

    async listFeatureNames(): Promise<string[]> {
        const features = await this.#provider.getFeatureFlags();
        const featureNameSet = new Set(features.map((feature) => feature.id));
        return Array.from(featureNameSet);
    }

    // If multiple feature flags are found, the first one takes precedence.
    async isEnabled(featureName: string, context?: unknown): Promise<boolean> {
        const result = await this.#evaluateFeature(featureName, context);
        return result.enabled;
    }

    async getVariant(featureName: string, context?: ITargetingContext): Promise<Variant | undefined> {
        const result = await this.#evaluateFeature(featureName, context);
        return result.variant;
    }

    async #assignVariant(featureFlag: FeatureFlag, context: ITargetingContext): Promise<VariantAssignment> {
        // user allocation
        if (featureFlag.allocation?.user !== undefined) {
            for (const userAllocation of featureFlag.allocation.user) {
                if (isTargetedUser(context.userId, userAllocation.users)) {
                    return getVariantAssignment(featureFlag, userAllocation.variant, VariantAssignmentReason.User);
                }
            }
        }

        // group allocation
        if (featureFlag.allocation?.group !== undefined) {
            for (const groupAllocation of featureFlag.allocation.group) {
                if (isTargetedGroup(context.groups, groupAllocation.groups)) {
                    return getVariantAssignment(featureFlag, groupAllocation.variant, VariantAssignmentReason.Group);
                }
            }
        }

        // percentile allocation
        if (featureFlag.allocation?.percentile !== undefined) {
            for (const percentileAllocation of featureFlag.allocation.percentile) {
                const hint = featureFlag.allocation.seed ?? `allocation\n${featureFlag.id}`;
                if (isTargetedPercentile(context.userId, hint, percentileAllocation.from, percentileAllocation.to)) {
                    return getVariantAssignment(featureFlag, percentileAllocation.variant, VariantAssignmentReason.Percentile);
                }
            }
        }

        return { variant: undefined, reason: VariantAssignmentReason.None };
    }

    async #isEnabled(featureFlag: FeatureFlag, context?: unknown): Promise<boolean> {
        if (featureFlag.enabled !== true) {
            // If the feature is not explicitly enabled, then it is disabled by default.
            return false;
        }

        const clientFilters = featureFlag.conditions?.client_filters;
        if (clientFilters === undefined || clientFilters.length <= 0) {
            // If there are no client filters, then the feature is enabled.
            return true;
        }

        const requirementType: RequirementType = featureFlag.conditions?.requirement_type ?? "Any"; // default to any.

        /**
         * While iterating through the client filters, we short-circuit the evaluation based on the requirement type.
         * - When requirement type is "All", the feature is enabled if all client filters are matched. If any client filter is not matched, the feature is disabled, otherwise it is enabled. `shortCircuitEvaluationResult` is false.
         * - When requirement type is "Any", the feature is enabled if any client filter is matched. If any client filter is matched, the feature is enabled, otherwise it is disabled. `shortCircuitEvaluationResult` is true.
         */
        const shortCircuitEvaluationResult: boolean = requirementType === "Any";

        for (const clientFilter of clientFilters) {
            const matchedFeatureFilter = this.#featureFilters.get(clientFilter.name);
            const contextWithFeatureName = { featureName: featureFlag.id, parameters: clientFilter.parameters };
            if (matchedFeatureFilter === undefined) {
                console.warn(`Feature filter ${clientFilter.name} is not found.`);
                return false;
            }
            if (await matchedFeatureFilter.evaluate(contextWithFeatureName, context) === shortCircuitEvaluationResult) {
                return shortCircuitEvaluationResult;
            }
        }

        // If we get here, then we have not found a client filter that matches the requirement type.
        return !shortCircuitEvaluationResult;
    }

    async #evaluateFeature(featureName: string, context: unknown): Promise<EvaluationResult> {
        const featureFlag = await this.#provider.getFeatureFlag(featureName);
        const result = new EvaluationResult(featureFlag);

        if (featureFlag === undefined) {
            return result;
        }

        // Ensure that the feature flag is in the correct format. Feature providers should validate the feature flags, but we do it here as a safeguard.
        // TODO: move to the feature flag provider implementation.
        validateFeatureFlagFormat(featureFlag);

        // Evaluate if the feature is enabled.
        result.enabled = await this.#isEnabled(featureFlag, context);

        // Determine Variant
        let variantDef: VariantDefinition | undefined;
        let reason: VariantAssignmentReason = VariantAssignmentReason.None;

        // featureFlag.variant not empty
        if (featureFlag.variants !== undefined && featureFlag.variants.length > 0) {
            if (!result.enabled) {
                // not enabled, assign default if specified
                if (featureFlag.allocation?.default_when_disabled !== undefined) {
                    variantDef = featureFlag.variants.find(v => v.name == featureFlag.allocation?.default_when_disabled);
                    reason = VariantAssignmentReason.DefaultWhenDisabled;
                } else {
                    // no default specified
                    variantDef = undefined;
                    reason = VariantAssignmentReason.DefaultWhenDisabled;
                }
            } else {
                // enabled, assign based on allocation
                if (context !== undefined && featureFlag.allocation !== undefined) {
                    const variantAndReason = await this.#assignVariant(featureFlag, context as ITargetingContext);
                    variantDef = variantAndReason.variant;
                    reason = variantAndReason.reason;
                }

                // allocation failed, assign default if specified
                if (variantDef === undefined && reason === VariantAssignmentReason.None) {
                    if (featureFlag.allocation?.default_when_enabled !== undefined) {
                        variantDef = featureFlag.variants.find(v => v.name == featureFlag.allocation?.default_when_enabled);
                        reason = VariantAssignmentReason.DefaultWhenEnabled;
                    }
                }
            }
        }

        // TODO: send telemetry for variant assignment reason in the future.
        console.log(`Variant assignment for feature ${featureName}: ${variantDef?.name ?? "default"} (${reason})`);

        if (variantDef?.configuration_reference !== undefined) {
            console.warn("Configuration reference is not supported yet.");
        }

        result.variant = variantDef !== undefined ? new Variant(variantDef.name, variantDef.configuration_value) : undefined;
        result.variantAssignmentReason = reason;

        // Status override for isEnabled
        if (variantDef !== undefined && featureFlag.enabled) {
            if (variantDef.status_override === "Enabled") {
                result.enabled = true;
            } else if (variantDef.status_override === "Disabled") {
                result.enabled = false;
            }
        }

        return result;
    }
}

interface FeatureManagerOptions {
    customFilters?: IFeatureFilter[];
}

/**
 * Validates the format of the feature flag definition.
 *
 * FeatureFlag data objects are from IFeatureFlagProvider, depending on the implementation.
 * Thus the properties are not guaranteed to have the expected types.
 *
 * @param featureFlag The feature flag definition to validate.
 */
function validateFeatureFlagFormat(featureFlag: any): void {
    if (featureFlag.enabled !== undefined && typeof featureFlag.enabled !== "boolean") {
        throw new Error(`Feature flag ${featureFlag.id} has an invalid 'enabled' value.`);
    }
    // TODO: add more validations.
    // TODO: should be moved to the feature flag provider.
}

/**
 * Try to get the variant assignment for the given variant name. If the variant is not found, override the reason with VariantAssignmentReason.None.
 *
 * @param featureFlag feature flag definition
 * @param variantName variant name
 * @param reason variant assignment reason
 * @returns variant assignment containing the variant definition and the reason
 */
function getVariantAssignment(featureFlag: FeatureFlag, variantName: string, reason: VariantAssignmentReason): VariantAssignment {
    const variant = featureFlag.variants?.find(v => v.name == variantName);
    if (variant !== undefined) {
        return { variant, reason };
    } else {
        console.warn(`Variant ${variantName} not found for feature ${featureFlag.id}.`);
        return { variant: undefined, reason: VariantAssignmentReason.None };
    }
}

type VariantAssignment = {
    variant: VariantDefinition | undefined;
    reason: VariantAssignmentReason;
};

enum VariantAssignmentReason {
    /**
     * Variant allocation did not happen. No variant is assigned.
     */
    None,

    /**
     * The default variant is assigned when a feature flag is disabled.
     */
    DefaultWhenDisabled,

    /**
     * The default variant is assigned because of no applicable user/group/percentile allocation when a feature flag is enabled.
     */
    DefaultWhenEnabled,

    /**
     * The variant is assigned because of the user allocation when a feature flag is enabled.
     */
    User,

    /**
     * The variant is assigned because of the group allocation when a feature flag is enabled.
     */
    Group,

    /**
     * The variant is assigned because of the percentile allocation when a feature flag is enabled.
     */
    Percentile
}

class EvaluationResult {
    constructor(
        // feature flag definition
        public readonly feature: FeatureFlag | undefined,

        // enabled state
        public enabled: boolean = false,

        // variant assignment
        public variant: Variant | undefined = undefined,
        public variantAssignmentReason: VariantAssignmentReason = VariantAssignmentReason.None
    ) { }
}
