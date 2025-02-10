// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * Contextual information that is required to perform a targeting evaluation.
 */
export interface ITargetingContext {
    /**
     * The user id that should be considered when evaluating if the context is being targeted.
     */
    userId?: string;
    /**
     * The groups that should be considered when evaluating if the context is being targeted.
     */
    groups?: string[];
}

/**
 * Type definition for a function that, when invoked, returns the @see ITargetingContext for targeting evaluation.
 */
export type TargetingContextAccessor = () => ITargetingContext;
