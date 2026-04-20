// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { IFeatureFilter } from "./featureFilter.js";
import { IFeatureManager } from "../model.js";

type ParentFeatureFilterEvaluationContext = {
    featureName: string;
    parameters: ParentFeatureFilterParameters;
};

type ParentFeatureFilterParameters = {
    Name: string
};

export class ParentFeatureFilter implements IFeatureFilter {
    readonly name: string = "Microsoft.ParentFeature";
    readonly #featureManager: IFeatureManager;

    constructor(featureManager: IFeatureManager) {
        this.#featureManager = featureManager;
    }

    async evaluate(context: ParentFeatureFilterEvaluationContext): Promise<boolean> {
        const {featureName, parameters} = context;

        if (!parameters || !parameters.Name) {
            throw new Error(`ParentFeatureFilter: Missing required parameter 'Name' for feature '${featureName}'.`);
        }
        return await this.#featureManager.isEnabled(parameters.Name);
    }
}
