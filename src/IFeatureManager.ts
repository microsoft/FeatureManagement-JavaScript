// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export interface IFeatureManager {
    listFeatureNames(): Promise<string[]>;
    isEnabled(featureName: string, context?: unknown): Promise<boolean>;
}
