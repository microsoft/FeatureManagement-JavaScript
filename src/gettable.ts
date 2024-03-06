// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export interface IGettable {
    get<T>(key: string): T | undefined;
}

export function isGettable(object: unknown): object is IGettable {
    return typeof object === "object" && object !== null && typeof (object as IGettable).get === "function";
}