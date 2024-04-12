// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export interface IFeatureFilter {
    name: string; // e.g. Microsoft.TimeWindow
    evaluate(context: IFeatureFilterEvaluationContext, appContext?: unknown): Promise<boolean> | boolean;
}

export interface IFeatureFilterEvaluationContext {
    featureName: string;
    parameters?: unknown;
}
