// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { createHash } from "crypto";

/**
 * Determines if the user is part of the audience, based on the user id and the percentage range.
 *
 * @param userId user id from app context
 * @param hint hint string to be included in the context id
 * @param from percentage range start
 * @param to percentage range end
 * @returns true if the user is part of the audience, false otherwise
 */
export function isTargetedPercentile(userId: string | undefined, hint: string, from: number, to: number): boolean {
    if (from < 0 || from > 100) {
        throw new Error("The 'from' value must be between 0 and 100.");
    }
    if (to <= 0 || to > 100) {
        throw new Error("The 'to' value must be between 0 and 100.");
    }
    if (from > to) {
        throw new Error("The 'from' value cannot be larger than the 'to' value.");
    }

    const audienceContextId = constructAudienceContextId(userId, hint);

    // Cryptographic hashing algorithms ensure adequate entropy across hash values.
    const contextMarker = stringToUint32(audienceContextId);
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

    for (const group of sourceGroups) {
        if (targetedGroups.includes(group)) {
            return true;
        }
    }

    return false;
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
 * @param str The string to convert.
 * @returns The uint32 value.
 */
function stringToUint32(str: string): number {
    // Create a SHA-256 hash of the string
    const hash = createHash("sha256").update(str).digest();

    // Get the first 4 bytes of the hash
    const first4Bytes = hash.subarray(0, 4);

    // Convert the 4 bytes to a uint32 with little-endian encoding
    const uint32 = first4Bytes.readUInt32LE(0);
    return uint32;
}
