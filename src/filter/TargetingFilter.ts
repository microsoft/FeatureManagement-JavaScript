// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

interface TargetingParameters {
    // TODO: add targeting parameters.
}

export class TargetingFilter {
    name = "Microsoft.Targeting";

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    evaluate(_parameters: TargetingParameters): boolean {
        throw new Error("Not implemented");
    }
}
