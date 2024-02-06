// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

// Converted from https://github.com/Azure/AppConfiguration/blob/main/docs/FeatureManagement/FeatureFlag.v1.1.0.schema.json

export interface FeatureDefinition {
  /**
   * An ID used to uniquely identify and reference the feature.
   */
  id: string

  /**
   * A description of the feature.
   */
  description?: string

  /**
   * A display name for the feature to use for display rather than the ID.
   */
  display_name?: string

  /**
   * A feature is OFF if enabled is false. If enabled is true, then the feature is ON if there are no conditions (null or empty) or if the conditions are satisfied.
   */
  enabled: boolean

  /**
   * The declaration of conditions used to dynamically enable features.
   */
  conditions?: FeatureEnablementConditions
}

export enum RequirementType {
  Any = "Any",
  All = "All"
}

export interface FeatureEnablementConditions {
  /**
   * Determines whether any or all registered client filters must be enabled for the feature to be considered enabled.
   */
  requirement_type?: RequirementType

  /**
   * Filters that must run on the client and be evaluated as true for the feature to be considered enabled.
   */
  client_filters?: ClientFilter[]
}

export interface ClientFilter {
  /**
   * The name used to refer to and require a client filter.
   */
  name: string
  /**
   * Custom parameters for a given client filter. A client filter can require any set of parameters of any type.
   */
  parameters?: unknown
}

// Feature Management Section fed into feature manager.
export const FEATURE_MANAGEMENT_KEY = "FeatureManagement"
export const FEATURE_FLAGS_KEY = "FeatureFlags"
export interface FeatureConfiguration {
  [FEATURE_FLAGS_KEY]: FeatureDefinition[]
}
