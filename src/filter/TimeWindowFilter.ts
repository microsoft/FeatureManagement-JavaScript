// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { IFeatureFilter } from "./FeatureFilter";

// [Start, End)
type TimeWindowParameters = {
    Start?: string;
    End?: string;
}

type TimeWindowFilterEvaluationContext = {
    featureName: string;
    parameters: TimeWindowParameters;
}

export class TimewindowFilter implements IFeatureFilter {
    name: string = "Microsoft.TimeWindow";

    evaluate(context: TimeWindowFilterEvaluationContext): boolean {
        const {featureName, parameters} = context;
        const startTime = parameters.Start !== undefined ? new Date(parameters.Start) : undefined;
        const endTime = parameters.End !== undefined ? new Date(parameters.End) : undefined;

        if (startTime === undefined && endTime === undefined) {
            // If neither start nor end time is specified, then the filter is not applicable.
            console.warn(`The ${this.name} feature filter is not valid for feature ${featureName}. It must specify either 'Start', 'End', or both.`);
            return false;
        }
        const now = new Date();
        return (startTime === undefined || startTime <= now) && (endTime === undefined || now < endTime);
    }
}
