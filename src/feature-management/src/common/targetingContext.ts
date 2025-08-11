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
 * Provides access to the current targeting context.
 */
export interface ITargetingContextAccessor {
    /**
     * Retrieves the current targeting context.
     */
    getTargetingContext: () => ITargetingContext | undefined;
}
