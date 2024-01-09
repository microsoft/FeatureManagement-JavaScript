// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

// Converted from https://github.com/Azure/AppConfiguration/blob/main/docs/FeatureManagement/FeatureFlag.v1.1.0.schema.json

/**
 * An ID used to uniquely identify and reference the feature.
 */
export type FeatureID = string
/**
 * A description of the feature.
 */
export type FeatureDescription = string
/**
 * A display name for the feature to use for display rather than the ID.
 */
export type FeatureDisplayName = string
/**
 * A feature is OFF if enabled is false. If enabled is true, then the feature is ON if there are no conditions (null or empty) or if the conditions are satisfied.
 */
export type EnabledState = boolean
/**
 * Determines whether any or all registered client filters must be enabled for the feature to be considered enabled.
 */
export enum RequirementType {
    Any = "Any",
    All = "All"
}
/**
 * The name used to refer to and require a client filter.
 */
export type ClientFilterName = string
/**
 * Filters that must run on the client and be evaluated as true for the feature to be considered enabled.
 */
export type ClientFilterCollection = ClientFilter[]

export interface FeatureDeclaration {
  id: FeatureID
  description?: FeatureDescription
  display_name?: FeatureDisplayName
  enabled: EnabledState
  conditions?: FeatureEnablementConditions
  [k: string]: unknown
}
/**
 * The declaration of conditions used to dynamically enable features.
 */
export interface FeatureEnablementConditions {
  requirement_type?: RequirementType
  client_filters?: ClientFilterCollection
  [k: string]: unknown
}
export interface ClientFilter {
  name: ClientFilterName
  parameters?: ClientFilterParameters
  [k: string]: unknown
}
/**
 * Custom parameters for a given client filter. A client filter can require any set of parameters of any type.
 */
export interface ClientFilterParameters {
  /**
   * This interface was referenced by `ClientFilterParameters`'s JSON-Schema definition
   * via the `patternProperty` "^.*$".
   */
  [k: string]:
    | string
    | null
    | {
        [k: string]: unknown
      }
    | number
    | unknown[]
    | boolean
}

// Feature Management definition
export const FEATURE_MANAGEMENT_KEY = "FeatureManagement"
export const FEATURE_FLAGS_KEY = "FeatureFlags"
export interface FeatureManagement {
  [FEATURE_FLAGS_KEY]: FeatureDeclaration[]
}
