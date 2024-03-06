// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export interface IFeatureFilter {
    name: string; //e.g. Microsoft.TimeWindow
    evaluate(parameters?: unknown, appContext?: unknown): Promise<boolean> | boolean;
}

