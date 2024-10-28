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
        throw new TypeError("Feature flag ID must be a string.");
    }
    if (featureFlag.description !== undefined && typeof featureFlag.description !== "string") {
        throw new TypeError("Feature flag description must be a string.");
    }
    if (featureFlag.display_name !== undefined && typeof featureFlag.display_name !== "string") {
        throw new TypeError("Feature flag display name must be a string.");
    }
    if (featureFlag.enabled !== undefined && typeof featureFlag.enabled !== "boolean") {
        throw new TypeError("Feature flag enabled must be a boolean.");
    }
    if (featureFlag.conditions !== undefined) {
        validateFeatureEnablementConditions(featureFlag.conditions);
    }
    // variants, allocation, and telemetry
    if (featureFlag.variants !== undefined) {
        validateVariants(featureFlag.variants);
    }
    if (featureFlag.allocation !== undefined) {
        validateVariantAllocation(featureFlag.allocation);
    }
    if (featureFlag.telemetry !== undefined) {
        validateTelemetryOptions(featureFlag.telemetry);
    }
}

function validateFeatureEnablementConditions(conditions: any) {
    if (conditions.requirement_type !== undefined && conditions.requirement_type !== "Any" && conditions.requirement_type !== "All") {
        throw new TypeError("Feature enablement conditions requirement type must be 'Any' or 'All'.");
    }
    if (conditions.client_filters !== undefined) {
        validateClientFilters(conditions.client_filters);
    }
}

function validateClientFilters(client_filters: any) {
    if (!Array.isArray(client_filters)) {
        throw new TypeError("Client filter Collection must be an array.");
    }

    for (const filter of client_filters) {
        if (typeof filter.type !== "object") {
            throw new TypeError("Client filter must be an object.");
        }
        if (typeof filter.name !== "string") {
            throw new TypeError("Client filter name must be a string.");
        }
        if (filter.parameters !== undefined && typeof filter.parameters !== "object") {
            throw new TypeError("Client filter parameters must be an object.");
        }
        // validate parameters here if we have schema of specific filters in the future
    }
}

function validateVariants(variants: any) {
    if (!Array.isArray(variants)) {
        throw new TypeError("Variants must be an array.");
    }

    for (const variant of variants) {
        if (typeof variant.name !== "string") {
            throw new TypeError("Variant name must be a string.");
        }
        // skip configuration_value validation as it accepts any type
        if (variant.status_override !== undefined && typeof variant.status_override !== "string") {
            throw new TypeError("Variant status override must be a string.");
        }
        if (variant.status_override !== undefined && variant.status_override !== "None" && variant.status_override !== "Enabled" && variant.status_override !== "Disabled") {
            throw new TypeError("Variant status override must be 'None', 'Enabled', or 'Disabled'.");
        }
    }
}

// #region Allocation
function validateVariantAllocation(allocation: any) {
    if (typeof allocation !== "object") {
        throw new TypeError("Variant allocation must be an object.");
    }

    if (allocation.default_when_disabled !== undefined && typeof allocation.default_when_disabled !== "string") {
        throw new TypeError("Variant allocation default_when_disabled must be a string.");
    }
    if (allocation.default_when_enabled !== undefined && typeof allocation.default_when_enabled !== "string") {
        throw new TypeError("Variant allocation default_when_enabled must be a string.");
    }
    if (allocation.user !== undefined) {
        validateUserVariantAllocation(allocation.user);
    }
    if (allocation.group !== undefined) {
        validateGroupVariantAllocation(allocation.group);
    }
    if (allocation.percentile !== undefined) {
        validatePercentileVariantAllocation(allocation.percentile);
    }
    if (allocation.seed !== undefined && typeof allocation.seed !== "string") {
        throw new TypeError("Variant allocation seed must be a string.");
    }
}

function validateUserVariantAllocation(UserAllocations: any) {
    if (!Array.isArray(UserAllocations)) {
        throw new TypeError("User allocations must be an array.");
    }

    for (const allocation of UserAllocations) {
        if (typeof allocation.variant !== "string") {
            throw new TypeError("User allocation variant must be a string.");
        }
        if (!Array.isArray(allocation.users)) {
            throw new TypeError("User allocation users must be an array.");
        }
        for (const user of allocation.users) {
            if (typeof user !== "string") {
                throw new TypeError("Elements in User allocation users must be strings.");
            }
        }
    }
}

function validateGroupVariantAllocation(groupAllocations: any) {
    if (!Array.isArray(groupAllocations)) {
        throw new TypeError("Group allocations must be an array.");
    }

    for (const allocation of groupAllocations) {
        if (typeof allocation.variant !== "string") {
            throw new TypeError("Group allocation variant must be a string.");
        }
        if (!Array.isArray(allocation.groups)) {
            throw new TypeError("Group allocation groups must be an array.");
        }
        for (const group of allocation.groups) {
            if (typeof group !== "string") {
                throw new TypeError("Elements in Group allocation groups must be strings.");
            }
        }
    }
}

function validatePercentileVariantAllocation(percentileAllocations: any) {
    if (!Array.isArray(percentileAllocations)) {
        throw new TypeError("Percentile allocations must be an array.");
    }

    for (const allocation of percentileAllocations) {
        if (typeof allocation.variant !== "string") {
            throw new TypeError("Percentile allocation variant must be a string.");
        }
        if (typeof allocation.from !== "number" || allocation.from < 0 || allocation.from > 100) {
            throw new TypeError("Percentile allocation from must be a number between 0 and 100.");
        }
        if (typeof allocation.to !== "number" || allocation.to < 0 || allocation.to > 100) {
            throw new TypeError("Percentile allocation to must be a number between 0 and 100.");
        }
    }
}
// #endregion

// #region Telemetry
function validateTelemetryOptions(telemetry: any) {
    if (typeof telemetry !== "object") {
        throw new TypeError("Telemetry options must be an object.");
    }

    if (telemetry.enabled !== undefined && typeof telemetry.enabled !== "boolean") {
        throw new TypeError("Telemetry enabled must be a boolean.");
    }
    if (telemetry.metadata !== undefined && typeof telemetry.metadata !== "object") {
        throw new TypeError("Telemetry metadata must be an object.");
    }
    // TODO: validate metadata keys (string) and values (string), not sure if we need to do this
}
// #endregion
