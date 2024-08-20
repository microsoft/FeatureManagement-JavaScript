// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { IFeatureFilter } from "./FeatureFilter";

type TargetingFilterParameters = {
    Audience: {
        DefaultRolloutPercentage: number;
        Users?: string[];
        Groups?: {
            Name: string;
            RolloutPercentage: number;
        }[];
        Exclusion?: {
            Users?: string[];
            Groups?: string[];
        };
    }
}

type TargetingFilterEvaluationContext = {
    featureName: string;
    parameters: TargetingFilterParameters;
}

type TargetingFilterAppContext = {
    userId?: string;
    groups?: string[];
}

export class TargetingFilter implements IFeatureFilter {
    name: string = "Microsoft.Targeting";

    async evaluate(context: TargetingFilterEvaluationContext, appContext?: TargetingFilterAppContext): Promise<boolean> {
        const { featureName, parameters } = context;
        TargetingFilter.#validateParameters(parameters);

        if (appContext === undefined) {
            throw new Error("The app context is required for targeting filter.");
        }

        if (parameters.Audience.Exclusion !== undefined) {
            // check if the user is in the exclusion list
            if (appContext?.userId !== undefined &&
                parameters.Audience.Exclusion.Users !== undefined &&
                parameters.Audience.Exclusion.Users.includes(appContext.userId)) {
                return false;
            }
            // check if the user is in a group within exclusion list
            if (appContext?.groups !== undefined &&
                parameters.Audience.Exclusion.Groups !== undefined) {
                for (const excludedGroup of parameters.Audience.Exclusion.Groups) {
                    if (appContext.groups.includes(excludedGroup)) {
                        return false;
                    }
                }
            }
        }

        // check if the user is being targeted directly
        if (appContext?.userId !== undefined &&
            parameters.Audience.Users !== undefined &&
            parameters.Audience.Users.includes(appContext.userId)) {
            return true;
        }

        // check if the user is in a group that is being targeted
        if (appContext?.groups !== undefined &&
            parameters.Audience.Groups !== undefined) {
            for (const group of parameters.Audience.Groups) {
                if (appContext.groups.includes(group.Name)) {
                    const audienceContextId = constructAudienceContextId(featureName, appContext.userId, group.Name);
                    const rolloutPercentage = group.RolloutPercentage;
                    if (await TargetingFilter.#isTargeted(audienceContextId, rolloutPercentage)) {
                        return true;
                    }
                }
            }
        }

        // check if the user is being targeted by a default rollout percentage
        const defaultContextId = constructAudienceContextId(featureName, appContext?.userId);
        return TargetingFilter.#isTargeted(defaultContextId, parameters.Audience.DefaultRolloutPercentage);
    }

    static async #isTargeted(audienceContextId: string, rolloutPercentage: number): Promise<boolean> {
        if (rolloutPercentage === 100) {
            return true;
        }
        // Cryptographic hashing algorithms ensure adequate entropy across hash values.
        const contextMarker = await stringToUint32(audienceContextId);
        const contextPercentage = (contextMarker / 0xFFFFFFFF) * 100;
        return contextPercentage < rolloutPercentage;
    }

    static #validateParameters(parameters: TargetingFilterParameters): void {
        if (parameters.Audience.DefaultRolloutPercentage < 0 || parameters.Audience.DefaultRolloutPercentage > 100) {
            throw new Error("Audience.DefaultRolloutPercentage must be a number between 0 and 100.");
        }
        // validate RolloutPercentage for each group
        if (parameters.Audience.Groups !== undefined) {
            for (const group of parameters.Audience.Groups) {
                if (group.RolloutPercentage < 0 || group.RolloutPercentage > 100) {
                    throw new Error(`RolloutPercentage of group ${group.Name} must be a number between 0 and 100.`);
                }
            }
        }
    }
}

/**
 * Constructs the context id for the audience.
 * The context id is used to determine if the user is part of the audience for a feature.
 * If groupName is provided, the context id is constructed as follows:
 *  userId + "\n" + featureName + "\n" + groupName
 * Otherwise, the context id is constructed as follows:
 *  userId + "\n" + featureName
 *
 * @param featureName name of the feature
 * @param userId userId from app context
 * @param groupName group name from app context
 * @returns a string that represents the context id for the audience
 */
function constructAudienceContextId(featureName: string, userId: string | undefined, groupName?: string) {
    let contextId = `${userId ?? ""}\n${featureName}`;
    if (groupName !== undefined) {
        contextId += `\n${groupName}`;
    }
    return contextId
}

async function stringToUint32(str: string): Promise<number> {
    let crypto;

    // Check for browser environment
    if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
        crypto = window.crypto;
    }
    // Check for Node.js environment
    else if (typeof global !== "undefined" && global.crypto) {
        crypto = global.crypto;
    }
    // Fallback to native Node.js crypto module
    else {
        try {
            crypto = require("crypto");
        } catch (error) {
            console.error("Failed to load the crypto module:", error.message);
            throw error;
        }
    }

    // In the browser, use crypto.subtle.digest
    if (crypto.subtle) {
        const data = new TextEncoder().encode(str);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const dataView = new DataView(hashBuffer);
        const uint32 = dataView.getUint32(0, true);
        return uint32;
    }
    // In Node.js, use the crypto module's hash function
    else {
        const hash = crypto.createHash("sha256").update(str).digest();
        const uint32 = hash.readUInt32LE(0);
        return uint32;
    }
}
