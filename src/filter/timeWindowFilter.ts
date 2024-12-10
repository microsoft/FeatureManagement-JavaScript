// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { IFeatureFilter } from "./featureFilter.js";
import { RecurrenceSpec } from "./recurrence/model.js";
import { parseRecurrenceParameter } from "./recurrence/validator.js";
import { matchRecurrence } from "./recurrence/evaluator.js";
import { UNRECOGNIZABLE_VALUE_ERROR_MESSAGE, buildInvalidParameterErrorMessage } from "./utils.js";

type TimeWindowFilterEvaluationContext = {
    featureName: string;
    parameters: TimeWindowParameters;
};

type TimeWindowParameters = {
    Start?: string;
    End?: string;
    Recurrence?: RecurrenceParameter;
};

export type RecurrenceParameter = {
    Pattern: {
        Type: string;
        Interval?: number;
        DaysOfWeek?: string[];
        FirstDayOfWeek?: string;
    },
    Range: {
        Type: string;
        EndDate?: string;
        NumberOfOccurrences?: number;
    }
};

export class TimeWindowFilter implements IFeatureFilter {
    name: string = "Microsoft.TimeWindow";

    evaluate(context: TimeWindowFilterEvaluationContext): boolean {
        const {featureName, parameters} = context;
        const startTime = parameters.Start !== undefined ? new Date(parameters.Start) : undefined;
        const endTime = parameters.End !== undefined ? new Date(parameters.End) : undefined;

        const baseErrorMessage = `The ${this.name} feature filter is not valid for feature ${featureName}. `;

        if (startTime === undefined && endTime === undefined) {
            // If neither start nor end time is specified, then the filter is not applicable.
            console.warn(baseErrorMessage + "It must specify either 'Start', 'End', or both.");
            return false;
        }

        if (startTime !== undefined && isNaN(startTime.getTime())) {
            console.warn(baseErrorMessage + buildInvalidParameterErrorMessage("Start", UNRECOGNIZABLE_VALUE_ERROR_MESSAGE));
            return false;
        }

        if (endTime !== undefined && isNaN(endTime.getTime())) {
            console.warn(baseErrorMessage + buildInvalidParameterErrorMessage("End", UNRECOGNIZABLE_VALUE_ERROR_MESSAGE));
            return false;
        }

        const now = new Date();

        if ((startTime === undefined || startTime <= now) && (endTime === undefined || now < endTime)) {
            return true;
        }

        if (parameters.Recurrence !== undefined) {
            let recurrence: RecurrenceSpec;
            try {
                recurrence = parseRecurrenceParameter(startTime, endTime, parameters.Recurrence);
            } catch (error) {
                console.warn(baseErrorMessage + error.message);
                return false;
            }
            return matchRecurrence(now, recurrence);
        }

        return false;
    }
}
