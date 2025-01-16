// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * Validates a feature flag object, checking if it conforms to the schema.
 * @param featureFlag The feature flag object to validate.
 */
export function validateFeatureFlag(featureFlag: any): void {
    if (featureFlag === undefined) {
        return; // no-op if feature flag is undefined, indicating that the feature flag is not found
    }
    if (featureFlag === null || typeof featureFlag !== "object") { // Note: typeof null = "object"
        throw new TypeError("Feature flag must be an object.");
    }
    if (typeof featureFlag.id !== "string") {
        throw new TypeError("Feature flag 'id' must be a string.");
    }

    if (featureFlag.enabled !== undefined && typeof featureFlag.enabled !== "boolean") {
        throw new TypeError(`Invalid feature flag: ${featureFlag.id}. Feature flag 'enabled' must be a boolean.`);
    }
    if (featureFlag.conditions !== undefined) {
        validateFeatureEnablementConditions(featureFlag.id, featureFlag.conditions);
    }
    if (featureFlag.variants !== undefined) {
        validateVariants(featureFlag.id, featureFlag.variants);
    }
    if (featureFlag.allocation !== undefined) {
        validateVariantAllocation(featureFlag.id, featureFlag.allocation);
    }
    if (featureFlag.telemetry !== undefined) {
        validateTelemetryOptions(featureFlag.id, featureFlag.telemetry);
    }
}

function validateFeatureEnablementConditions(id: string, conditions: any) {
    if (typeof conditions !== "object") {
        throw new TypeError(`Invalid feature flag: ${id}. Feature flag 'conditions' must be an object.`);
    }
    if (conditions.requirement_type !== undefined && conditions.requirement_type !== "Any" && conditions.requirement_type !== "All") {
        throw new TypeError(`Invalid feature flag: ${id}. 'requirement_type' must be 'Any' or 'All'.`);
    }
    if (conditions.client_filters !== undefined) {
        validateClientFilters(id, conditions.client_filters);
    }
}

function validateClientFilters(id: string, client_filters: any) {
    if (!Array.isArray(client_filters)) {
        throw new TypeError(`Invalid feature flag: ${id}. Feature flag conditions 'client_filters' must be an array.`);
    }

    for (const filter of client_filters) {
        if (typeof filter.name !== "string") {
            throw new TypeError(`Invalid feature flag: ${id}. Client filter 'name' must be a string.`);
        }
        if (filter.parameters !== undefined && typeof filter.parameters !== "object") {
            throw new TypeError(`Invalid feature flag: ${id}. Client filter 'parameters' must be an object.`);
        }
    }
}

function validateVariants(id: string, variants: any) {
    if (!Array.isArray(variants)) {
        throw new TypeError(`Invalid feature flag: ${id}. Feature flag 'variants' must be an array.`);
    }

    for (const variant of variants) {
        if (typeof variant.name !== "string") {
            throw new TypeError(`Invalid feature flag: ${id}. Variant 'name' must be a string.`);
        }
        // skip configuration_value validation as it accepts any type
        if (variant.status_override !== undefined && typeof variant.status_override !== "string") {
            throw new TypeError(`Invalid feature flag: ${id}. Variant 'status_override' must be a string.`);
        }
        if (variant.status_override !== undefined && variant.status_override !== "None" && variant.status_override !== "Enabled" && variant.status_override !== "Disabled") {
            throw new TypeError(`Invalid feature flag: ${id}. Variant 'status_override' must be 'None', 'Enabled', or 'Disabled'.`);
        }
    }
}

function validateVariantAllocation(id: string, allocation: any) {
    if (typeof allocation !== "object") {
        throw new TypeError(`Invalid feature flag: ${id}. Variant 'allocation' must be an object.`);
    }

    if (allocation.default_when_disabled !== undefined && typeof allocation.default_when_disabled !== "string") {
        throw new TypeError(`Invalid feature flag: ${id}. Variant allocation 'default_when_disabled' must be a string.`);
    }
    if (allocation.default_when_enabled !== undefined && typeof allocation.default_when_enabled !== "string") {
        throw new TypeError(`Invalid feature flag: ${id}. Variant allocation 'default_when_enabled' must be a string.`);
    }
    if (allocation.user !== undefined) {
        validateUserVariantAllocation(id, allocation.user);
    }
    if (allocation.group !== undefined) {
        validateGroupVariantAllocation(id, allocation.group);
    }
    if (allocation.percentile !== undefined) {
        validatePercentileVariantAllocation(id, allocation.percentile);
    }
    if (allocation.seed !== undefined && typeof allocation.seed !== "string") {
        throw new TypeError(`Invalid feature flag: ${id}. Variant allocation 'seed' must be a string.`);
    }
}

function validateUserVariantAllocation(id: string, UserAllocations: any) {
    if (!Array.isArray(UserAllocations)) {
        throw new TypeError(`Invalid feature flag: ${id}. Variant 'user' allocation must be an array.`);
    }

    for (const allocation of UserAllocations) {
        if (typeof allocation !== "object") {
            throw new TypeError(`Invalid feature flag: ${id}. Elements in variant 'user' allocation must be an object.`);
        }
        if (typeof allocation.variant !== "string") {
            throw new TypeError(`Invalid feature flag: ${id}. User allocation 'variant' must be a string.`);
        }
        if (!Array.isArray(allocation.users)) {
            throw new TypeError(`Invalid feature flag: ${id}. User allocation 'users' must be an array.`);
        }
        for (const user of allocation.users) {
            if (typeof user !== "string") {
                throw new TypeError(`Invalid feature flag: ${id}. Elements in user allocation 'users' must be strings.`);
            }
        }
    }
}

function validateGroupVariantAllocation(id: string, groupAllocations: any) {
    if (!Array.isArray(groupAllocations)) {
        throw new TypeError(`Invalid feature flag: ${id}. Variant 'group' allocation must be an array.`);
    }

    for (const allocation of groupAllocations) {
        if (typeof allocation !== "object") {
            throw new TypeError(`Invalid feature flag: ${id}. Elements in variant 'group' allocation must be an object.`);
        }
        if (typeof allocation.variant !== "string") {
            throw new TypeError(`Invalid feature flag: ${id}. Group allocation 'variant' must be a string.`);
        }
        if (!Array.isArray(allocation.groups)) {
            throw new TypeError(`Invalid feature flag: ${id}. Group allocation 'groups' must be an array.`);
        }
        for (const group of allocation.groups) {
            if (typeof group !== "string") {
                throw new TypeError(`Invalid feature flag: ${id}. Elements in group allocation 'groups' must be strings.`);
            }
        }
    }
}

function validatePercentileVariantAllocation(id: string, percentileAllocations: any) {
    if (!Array.isArray(percentileAllocations)) {
        throw new TypeError(`Invalid feature flag: ${id}. Variant 'percentile' allocation must be an array.`);
    }

    for (const allocation of percentileAllocations) {
        if (typeof allocation !== "object") {
            throw new TypeError(`Invalid feature flag: ${id}. Elements in variant 'percentile' allocation must be an object.`);
        }
        if (typeof allocation.variant !== "string") {
            throw new TypeError(`Invalid feature flag: ${id}. Percentile allocation 'variant' must be a string.`);
        }
        if (typeof allocation.from !== "number" || allocation.from < 0 || allocation.from > 100) {
            throw new TypeError(`Invalid feature flag: ${id}. Percentile allocation 'from' must be a number between 0 and 100.`);
        }
        if (typeof allocation.to !== "number" || allocation.to < 0 || allocation.to > 100) {
            throw new TypeError(`Invalid feature flag: ${id}. Percentile allocation 'to' must be a number between 0 and 100.`);
        }
    }
}
// #endregion

// #region Telemetry
function validateTelemetryOptions(id: string, telemetry: any) {
    if (typeof telemetry !== "object") {
        throw new TypeError(`Invalid feature flag: ${id}. Feature flag 'telemetry' must be an object.`);
    }
    if (telemetry.enabled !== undefined && typeof telemetry.enabled !== "boolean") {
        throw new TypeError(`Invalid feature flag: ${id}. Telemetry 'enabled' must be a boolean.`);
    }
    if (telemetry.metadata !== undefined && typeof telemetry.metadata !== "object") {
        throw new TypeError(`Invalid feature flag: ${id}. Telemetry 'metadata' must be an object.`);
    }
}
// #endregion
