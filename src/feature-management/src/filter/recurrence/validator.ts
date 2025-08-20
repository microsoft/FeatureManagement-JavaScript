// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { RecurrenceParameters } from "../timeWindowFilter.js";
import { VALUE_OUT_OF_RANGE_ERROR_MESSAGE, UNRECOGNIZABLE_VALUE_ERROR_MESSAGE, REQUIRED_PARAMETER_MISSING_ERROR_MESSAGE, buildInvalidParameterErrorMessage } from "../utils.js";
import { DayOfWeek, RecurrenceSpec, RecurrencePattern, RecurrenceRange, RecurrencePatternType, RecurrenceRangeType, DAYS_PER_WEEK, ONE_DAY_IN_MILLISECONDS } from "./model.js";
import { calculateWeeklyDayOffset, sortDaysOfWeek, getDayOfWeek } from "./utils.js";

export const START_NOT_MATCHED_ERROR_MESSAGE = "Start date is not a valid first occurrence.";
export const TIME_WINDOW_DURATION_OUT_OF_RANGE_ERROR_MESSAGE = "Time window duration cannot be longer than how frequently it occurs or be longer than 10 years.";
export const PATTERN = "Recurrence.Pattern";
export const PATTERN_TYPE = "Recurrence.Pattern.Type";
export const INTERVAL = "Recurrence.Pattern.Interval";
export const DAYS_OF_WEEK = "Recurrence.Pattern.DaysOfWeek";
export const FIRST_DAY_OF_WEEK = "Recurrence.Pattern.FirstDayOfWeek";
export const RANGE = "Recurrence.Range";
export const RANGE_TYPE = "Recurrence.Range.Type";
export const END_DATE = "Recurrence.Range.EndDate";
export const NUMBER_OF_OCCURRENCES = "Recurrence.Range.NumberOfOccurrences";

/**
 * Parses @see RecurrenceParameters into a @see RecurrenceSpec object. If the parameter is invalid, an error will be thrown.
 * @param startTime The start time of the base time window
 * @param day2 The end time of the base time window
 * @param recurrenceParameters The @see RecurrenceParameters to parse
 * @param TimeZoneOffset The time zone offset in milliseconds, by default 0
 * @returns A @see RecurrenceSpec object
 */
export function parseRecurrenceParameter(startTime: Date | undefined, endTime: Date | undefined, recurrenceParameters: RecurrenceParameters, TimeZoneOffset: number = 0): RecurrenceSpec {
    if (startTime === undefined) {
        throw new Error(buildInvalidParameterErrorMessage("Start", REQUIRED_PARAMETER_MISSING_ERROR_MESSAGE));
    }
    if (endTime === undefined) {
        throw new Error(buildInvalidParameterErrorMessage("End", REQUIRED_PARAMETER_MISSING_ERROR_MESSAGE));
    }
    if (startTime >= endTime) {
        throw new Error(buildInvalidParameterErrorMessage("End", VALUE_OUT_OF_RANGE_ERROR_MESSAGE));
    }
    const timeWindowDuration = endTime.getTime() - startTime.getTime();
    if (timeWindowDuration > 10 * 365 * ONE_DAY_IN_MILLISECONDS) { // time window duration cannot be longer than 10 years
        throw new Error(buildInvalidParameterErrorMessage("End", TIME_WINDOW_DURATION_OUT_OF_RANGE_ERROR_MESSAGE));
    }

    return {
        startTime: startTime,
        duration: timeWindowDuration,
        pattern: parseRecurrencePattern(startTime, endTime, recurrenceParameters, TimeZoneOffset),
        range: parseRecurrenceRange(startTime, recurrenceParameters),
        timezoneOffset: TimeZoneOffset
    };
}

function parseRecurrencePattern(startTime: Date, endTime: Date, recurrenceParameters: RecurrenceParameters, timeZoneOffset: number): RecurrencePattern {
    const rawPattern = recurrenceParameters.Pattern;
    if (rawPattern === undefined) {
        throw new Error(buildInvalidParameterErrorMessage(PATTERN, REQUIRED_PARAMETER_MISSING_ERROR_MESSAGE));
    }
    if (rawPattern.Type === undefined) {
        throw new Error(buildInvalidParameterErrorMessage(PATTERN_TYPE, REQUIRED_PARAMETER_MISSING_ERROR_MESSAGE));
    }
    const patternType = RecurrencePatternType[rawPattern.Type];
    if (patternType === undefined) {
        throw new Error(buildInvalidParameterErrorMessage(PATTERN_TYPE, UNRECOGNIZABLE_VALUE_ERROR_MESSAGE));
    }
    let interval = rawPattern.Interval;
    if (interval !== undefined) {
        if (typeof interval !== "number") {
            throw new Error(buildInvalidParameterErrorMessage(INTERVAL, UNRECOGNIZABLE_VALUE_ERROR_MESSAGE));
        } else if (interval <= 0 || !Number.isInteger(interval)) {
            throw new Error(buildInvalidParameterErrorMessage(INTERVAL, VALUE_OUT_OF_RANGE_ERROR_MESSAGE));
        }
    } else {
        interval = 1;
    }
    const parsedPattern: RecurrencePattern = {
        type: patternType,
        interval: interval
    };
    const timeWindowDuration = endTime.getTime() - startTime.getTime();
    if (patternType === RecurrencePatternType.Daily) {
        if (timeWindowDuration > interval * ONE_DAY_IN_MILLISECONDS) {
            throw new Error(buildInvalidParameterErrorMessage("End", TIME_WINDOW_DURATION_OUT_OF_RANGE_ERROR_MESSAGE));
        }
    } else if (patternType === RecurrencePatternType.Weekly) {
        let firstDayOfWeek: DayOfWeek;
        if (rawPattern.FirstDayOfWeek !== undefined) {
            firstDayOfWeek = DayOfWeek[rawPattern.FirstDayOfWeek];
            if (firstDayOfWeek === undefined) {
                throw new Error(buildInvalidParameterErrorMessage(FIRST_DAY_OF_WEEK, UNRECOGNIZABLE_VALUE_ERROR_MESSAGE));
            }
        }
        else {
            firstDayOfWeek = DayOfWeek.Sunday;
        }
        parsedPattern.firstDayOfWeek = firstDayOfWeek;

        if (rawPattern.DaysOfWeek === undefined || rawPattern.DaysOfWeek.length === 0) {
            throw new Error(buildInvalidParameterErrorMessage(DAYS_OF_WEEK, REQUIRED_PARAMETER_MISSING_ERROR_MESSAGE));
        }
        if (!Array.isArray(rawPattern.DaysOfWeek)) {
            throw new Error(buildInvalidParameterErrorMessage(DAYS_OF_WEEK, UNRECOGNIZABLE_VALUE_ERROR_MESSAGE));
        }
        const daysOfWeek = [...new Set(rawPattern.DaysOfWeek.map(day => DayOfWeek[day]))]; // dedup array
        if (daysOfWeek.some(day => day === undefined)) {
            throw new Error(buildInvalidParameterErrorMessage(DAYS_OF_WEEK, UNRECOGNIZABLE_VALUE_ERROR_MESSAGE));
        }
        if (timeWindowDuration > interval * DAYS_PER_WEEK * ONE_DAY_IN_MILLISECONDS ||
            !isDurationCompliantWithDaysOfWeek(timeWindowDuration, interval, daysOfWeek, firstDayOfWeek)) {
            throw new Error(buildInvalidParameterErrorMessage("End", TIME_WINDOW_DURATION_OUT_OF_RANGE_ERROR_MESSAGE));
        }
        parsedPattern.daysOfWeek = daysOfWeek;

        // check whether "Start" is a valid first occurrence
        const alignedStartDay = getDayOfWeek(startTime, timeZoneOffset);
        if (!daysOfWeek.find(day => day === alignedStartDay)) {
            throw new Error(buildInvalidParameterErrorMessage("Start", START_NOT_MATCHED_ERROR_MESSAGE));
        }
    }
    return parsedPattern;
}

function parseRecurrenceRange(startTime: Date, recurrenceParameters: RecurrenceParameters): RecurrenceRange {
    const rawRange = recurrenceParameters.Range;
    if (rawRange === undefined) {
        throw new Error(buildInvalidParameterErrorMessage(RANGE, REQUIRED_PARAMETER_MISSING_ERROR_MESSAGE));
    }
    if (rawRange.Type === undefined) {
        throw new Error(buildInvalidParameterErrorMessage(RANGE_TYPE, REQUIRED_PARAMETER_MISSING_ERROR_MESSAGE));
    }
    const rangeType = RecurrenceRangeType[rawRange.Type];
    if (rangeType === undefined) {
        throw new Error(buildInvalidParameterErrorMessage(RANGE_TYPE, UNRECOGNIZABLE_VALUE_ERROR_MESSAGE));
    }
    const parsedRange: RecurrenceRange = { type: rangeType };
    if (rangeType === RecurrenceRangeType.EndDate) {
        let endDate: Date;
        if (rawRange.EndDate !== undefined) {
            endDate = new Date(rawRange.EndDate);
            if (isNaN(endDate.getTime())) {
                throw new Error(buildInvalidParameterErrorMessage(END_DATE, UNRECOGNIZABLE_VALUE_ERROR_MESSAGE));
            }
            if (endDate < startTime) {
                throw new Error(buildInvalidParameterErrorMessage(END_DATE, VALUE_OUT_OF_RANGE_ERROR_MESSAGE));
            }
        } else {
            endDate = new Date(8.64e15); // the maximum date in ECMAScript: https://262.ecma-international.org/5.1/#sec-15.9.1.1
        }
        parsedRange.endDate = endDate;
    } else if (rangeType === RecurrenceRangeType.Numbered) {
        let numberOfOccurrences = rawRange.NumberOfOccurrences;
        if (numberOfOccurrences !== undefined) {
            if (typeof numberOfOccurrences !== "number") {
                throw new Error(buildInvalidParameterErrorMessage(NUMBER_OF_OCCURRENCES, UNRECOGNIZABLE_VALUE_ERROR_MESSAGE));
            } else if (numberOfOccurrences <= 0 || !Number.isInteger(numberOfOccurrences)) {
                throw new Error(buildInvalidParameterErrorMessage(NUMBER_OF_OCCURRENCES, VALUE_OUT_OF_RANGE_ERROR_MESSAGE));
            }
        } else {
            numberOfOccurrences = Number.MAX_SAFE_INTEGER;
        }
        parsedRange.numberOfOccurrences = numberOfOccurrences;
    }
    return parsedRange;
}

function isDurationCompliantWithDaysOfWeek(duration: number, interval: number, daysOfWeek: DayOfWeek[], firstDayOfWeek: DayOfWeek): boolean {
    if (daysOfWeek.length === 1) {
        return true;
    }
    const sortedDaysOfWeek = sortDaysOfWeek(daysOfWeek, firstDayOfWeek);
    let prev = sortedDaysOfWeek[0]; // the closest occurrence day to the first day of week
    let minGap = DAYS_PER_WEEK * ONE_DAY_IN_MILLISECONDS;
    for (let i = 1; i < sortedDaysOfWeek.length; i++) { // skip the first day
        const gap = calculateWeeklyDayOffset(sortedDaysOfWeek[i], prev) * ONE_DAY_IN_MILLISECONDS;
        minGap = gap < minGap ? gap : minGap;
        prev = sortedDaysOfWeek[i];
    }
    // It may across weeks. Check the next week if the interval is one week.
    if (interval == 1) {
        const gap = calculateWeeklyDayOffset(sortedDaysOfWeek[0], prev) * ONE_DAY_IN_MILLISECONDS;
        minGap = gap < minGap ? gap : minGap;
    }
    return minGap >= duration;
}
