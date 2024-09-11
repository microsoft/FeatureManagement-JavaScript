// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * Determines if the user is part of the audience, based on the user id and the percentage range.
 *
 * @param userId user id from app context
 * @param hint hint string to be included in the context id
 * @param from percentage range start
 * @param to percentage range end
 * @returns true if the user is part of the audience, false otherwise
 */
export async function isTargetedPercentile(userId: string | undefined, hint: string, from: number, to: number): Promise<boolean> {
    if (from < 0 || from > 100) {
        throw new Error("The 'from' value must be between 0 and 100.");
    }
    if (to < 0 || to > 100) {
        throw new Error("The 'to' value must be between 0 and 100.");
    }
    if (from > to) {
        throw new Error("The 'from' value cannot be larger than the 'to' value.");
    }

    const audienceContextId = constructAudienceContextId(userId, hint);

    // Cryptographic hashing algorithms ensure adequate entropy across hash values.
    const contextMarker = await stringToUint32(audienceContextId);
    const contextPercentage = (contextMarker / 0xFFFFFFFF) * 100;

    // Handle edge case of exact 100 bucket
    if (to === 100) {
        return contextPercentage >= from;
    }

    return contextPercentage >= from && contextPercentage < to;
}

/**
 * Determines if the user is part of the audience, based on the groups they belong to.
 *
 * @param sourceGroups user groups from app context
 * @param targetedGroups targeted groups from feature configuration
 * @returns true if the user is part of the audience, false otherwise
 */
export function isTargetedGroup(sourceGroups: string[] | undefined, targetedGroups: string[]): boolean {
    if (sourceGroups === undefined) {
        return false;
    }

    return sourceGroups.some(group => targetedGroups.includes(group));
}

/**
 * Determines if the user is part of the audience, based on the user id.
 * @param userId user id from app context
 * @param users targeted users from feature configuration
 * @returns true if the user is part of the audience, false otherwise
 */
export function isTargetedUser(userId: string | undefined, users: string[]): boolean {
    if (userId === undefined) {
        return false;
    }

    return users.includes(userId);
}

/**
 * Constructs the context id for the audience.
 * The context id is used to determine if the user is part of the audience for a feature.
 *
 * @param userId userId from app context
 * @param hint hint string to be included in the context id
 * @returns a string that represents the context id for the audience
 */
function constructAudienceContextId(userId: string | undefined, hint: string): string {
    return `${userId ?? ""}\n${hint}`;
}

/**
 * Converts a string to a uint32 in little-endian encoding.
 * @param str the string to convert.
 * @returns a uint32 value.
 */
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
            if (typeof module !== "undefined" && module.exports) {
                crypto = require("crypto");
            }
            else {
                crypto = await import("crypto");
            }
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
