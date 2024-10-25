// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

// Converted from:
// https://github.com/Azure/AppConfiguration/blob/6e544296a5607f922a423df165f60801717c7800/docs/FeatureManagement/FeatureFlag.v2.0.0.schema.json

/**
 * A feature flag is a named property that can be toggled to enable or disable some feature of an application.
 */
export interface FeatureFlag {
  /**
   * An ID used to uniquely identify and reference the feature.
   */
  id: string;
  /**
   * A description of the feature.
   */
  description?: string;
  /**
   * A display name for the feature to use for display rather than the ID.
   */
  display_name?: string;
  /**
   * A feature is OFF if enabled is false. If enabled is true, then the feature is ON if there are no conditions (null or empty) or if the conditions are satisfied.
   */
  enabled?: boolean;
  /**
   * The declaration of conditions used to dynamically enable the feature.
   */
  conditions?: FeatureEnablementConditions;
  /**
   * The list of variants defined for this feature. A variant represents a configuration value of a feature flag that can be a string, a number, a boolean, or a JSON object.
   */
  variants?: Variant[];
  /**
   * Determines how variants should be allocated for the feature to various users.
   */
  allocation?: VariantAllocation;
  /**
   * The declaration of options used to configure telemetry for this feature.
   */
  telemetry?: TelemetryOptions
}

/**
* The declaration of conditions used to dynamically enable the feature
*/
interface FeatureEnablementConditions {
  /**
   * Determines whether any or all registered client filters must be evaluated as true for the feature to be considered enabled.
   */
  requirement_type?: RequirementType;
  /**
   * Filters that must run on the client and be evaluated as true for the feature to be considered enabled.
   */
  client_filters?: ClientFilter[];
}

export type RequirementType = "Any" | "All";

interface ClientFilter {
  /**
   * The name used to refer to a client filter.
   */
  name: string;
  /**
   * Parameters for a given client filter. A client filter can require any set of parameters of any type.
   */
  parameters?: Record<string, unknown>;
}

interface Variant {
  /**
   * The name used to refer to a feature variant.
   */
  name: string;
  /**
   * The configuration value for this feature variant.
   */
  configuration_value?: unknown;
  /**
   * Overrides the enabled state of the feature if the given variant is assigned. Does not override the state if value is None.
   */
  status_override?: "None" | "Enabled" | "Disabled";
}

/**
* Determines how variants should be allocated for the feature to various users.
*/
interface VariantAllocation {
  /**
   * Specifies which variant should be used when the feature is considered disabled.
   */
  default_when_disabled?: string;
  /**
   * Specifies which variant should be used when the feature is considered enabled and no other allocation rules are applicable.
   */
  default_when_enabled?: string;
  /**
   * A list of objects, each containing a variant name and list of users for whom that variant should be used.
   */
  user?: UserAllocation[];
  /**
   * A list of objects, each containing a variant name and list of groups for which that variant should be used.
   */
  group?: GroupAllocation[];
  /**
   * A list of objects, each containing a variant name and percentage range for which that variant should be used.
   */
  percentile?: PercentileAllocation[]
  /**
   * The value percentile calculations are based on. The calculated percentile is consistent across features for a given user if the same nonempty seed is used.
   */
  seed?: string;
}

interface UserAllocation {
  /**
   * The name of the variant to use if the user allocation matches the current user.
   */
  variant: string;
  /**
   * Collection of users where if any match the current user, the variant specified in the user allocation is used.
   */
  users: string[];
}

interface GroupAllocation {
  /**
   * The name of the variant to use if the group allocation matches a group the current user is in.
   */
  variant: string;
  /**
   * Collection of groups where if the current user is in any of these groups, the variant specified in the group allocation is used.
   */
  groups: string[];
}

interface PercentileAllocation {
  /**
   * The name of the variant to use if the calculated percentile for the current user falls in the provided range.
   */
  variant: string;
  /**
   * The lower end of the percentage range for which this variant will be used.
   */
  from: number;
  /**
   * The upper end of the percentage range for which this variant will be used.
   */
  to: number;
}

/**
* The declaration of options used to configure telemetry for this feature.
*/
interface TelemetryOptions {
  /**
   * Indicates if telemetry is enabled.
   */
  enabled?: boolean;
  /**
   * A container for metadata that should be bundled with flag telemetry.
   */
  metadata?: Record<string, string>;
}

// Feature Management Section fed into feature manager.
// Converted from https://github.com/Azure/AppConfiguration/blob/main/docs/FeatureManagement/FeatureManagement.v1.0.0.schema.json

export const FEATURE_MANAGEMENT_KEY = "feature_management";
export const FEATURE_FLAGS_KEY = "feature_flags";

export interface FeatureManagementConfiguration {
  feature_management: FeatureManagement
}

/**
 * Declares feature management configuration.
 */
export interface FeatureManagement {
  feature_flags: FeatureFlag[];
}
