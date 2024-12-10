// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { RecurrenceSpec, RecurrencePatternType, RecurrenceRangeType, DAYS_PER_WEEK, ONE_DAY_IN_MILLISECONDS } from "./model.js";
import { calculateWeeklyDayOffset, sortDaysOfWeek, getDayOfWeek, addDays } from "./utils.js";

type RecurrenceState = {
    previousOccurrence: Date;
    numberOfOccurrences: number;
}

/**
 * Checks if a provided datetime is within any recurring time window specified by the recurrence information
 * @param time A datetime
 * @param recurrenceSpec The recurrence spcification
 * @returns True if the given time is within any recurring time window; otherwise, false
 */
export function matchRecurrence(time: Date, recurrenceSpec: RecurrenceSpec): boolean {
    const recurrenceState = FindPreviousRecurrence(time, recurrenceSpec);
    if (recurrenceState) {
        return time.getTime() < recurrenceState.previousOccurrence.getTime() + recurrenceSpec.duration;
    }
    return false;
}

/**
 * Finds the closest previous recurrence occurrence before the given time according to the recurrence information
 * @param time A datetime
 * @param recurrenceSpec The recurrence specification
 * @returns The recurrence state if any previous occurrence is found; otherwise, undefined
 */
function FindPreviousRecurrence(time: Date, recurrenceSpec: RecurrenceSpec): RecurrenceState | undefined {
    if (time < recurrenceSpec.startTime) {
        return undefined;
    }
    let result: RecurrenceState;
    const pattern = recurrenceSpec.pattern;
    if (pattern.type === RecurrencePatternType.Daily) {
        result = FindPreviousDailyRecurrence(time, recurrenceSpec);
    } else if (pattern.type === RecurrencePatternType.Weekly) {
        result = FindPreviousWeeklyRecurrence(time, recurrenceSpec);
    } else {
        throw new Error("Unsupported recurrence pattern type.");
    }
    const { previousOccurrence, numberOfOccurrences } = result;

    const range = recurrenceSpec.range;
    if (range.type === RecurrenceRangeType.EndDate) {
        if (previousOccurrence > range.endDate!) {
            return undefined;
        }
    } else if (range.type === RecurrenceRangeType.Numbered) {
        if (numberOfOccurrences > range.numberOfOccurrences!) {
            return undefined;
        }
    }
    return result;
}

function FindPreviousDailyRecurrence(time: Date, recurrenceSpec: RecurrenceSpec): RecurrenceState {
    const startTime = recurrenceSpec.startTime;
    const timeGap = time.getTime() - startTime.getTime();
    const pattern = recurrenceSpec.pattern;
    const numberOfIntervals = Math.floor(timeGap / (pattern.interval * ONE_DAY_IN_MILLISECONDS));
    return {
        previousOccurrence: addDays(startTime, numberOfIntervals * pattern.interval),
        numberOfOccurrences: numberOfIntervals + 1
    };
}

function FindPreviousWeeklyRecurrence(time: Date, recurrenceSpec: RecurrenceSpec): RecurrenceState {
    /*
     * Algorithm:
     * 1. first find day 0 (d0), it's the day representing the start day on the week of `Start`.
     * 2. find start day of the most recent occurring week d0 + floor((time - d0) / (interval * 7)) * (interval * 7)
     * 3. if that's over 7 days ago, then previous occurence is the day with the max offset of the last occurring week
     * 4. if gotten this far, then the current week is the most recent occurring week:
         i. if time > day with min offset, then previous occurence is the day with max offset less than current
        ii. if time < day with min offset, then previous occurence is the day with the max offset of previous occurring week
     */
    const startTime = recurrenceSpec.startTime;
    const startDay = getDayOfWeek(startTime, recurrenceSpec.timezoneOffset);
    const pattern = recurrenceSpec.pattern;
    const sortedDaysOfWeek = sortDaysOfWeek(pattern.daysOfWeek!, pattern.firstDayOfWeek!);

    /*
     * Example:
     * startTime = 2024-12-11 (Tue)
     * pattern.interval = 2 pattern.firstDayOfWeek = Sun pattern.daysOfWeek = [Wed, Sun]
     * sortedDaysOfWeek = [Sun, Wed]
     * firstDayofStartWeek = 2024-12-08 (Sun)
     *
     * time = 2024-12-23 (Mon) timeGap = 15 days
     * the most recent occurring week: 2024-12-22 ~ 2024-12-28
     * number of intervals before the most recent occurring week = 15 / (2 * 7) = 1 (2024-12-08 ~ 2023-12-21)
     * number of occurrences before the most recent occurring week = 1 * 2 - 1 = 1 (2024-12-11)
     * firstDayOfLastOccurringWeek = 2024-12-22
     */
    const firstDayofStartWeek = addDays(startTime, -calculateWeeklyDayOffset(startDay, pattern.firstDayOfWeek!));
    const timeGap = time.getTime() - firstDayofStartWeek.getTime();
    // number of intervals before the most recent occurring week
    const numberOfIntervals = Math.floor(timeGap / (pattern.interval * DAYS_PER_WEEK * ONE_DAY_IN_MILLISECONDS));
    // number of occurrences before the most recent occurring week, it is possible to be negative
    let numberOfOccurrences = numberOfIntervals * sortedDaysOfWeek.length - sortedDaysOfWeek.indexOf(startDay);
    const firstDayOfLatestOccurringWeek = addDays(firstDayofStartWeek, numberOfIntervals * pattern.interval * DAYS_PER_WEEK);

    // the current time is out of the last occurring week
    if (time > addDays(firstDayOfLatestOccurringWeek, DAYS_PER_WEEK)) {
        numberOfOccurrences += sortDaysOfWeek.length;
        // day with max offset in the last occurring week
        const previousOccurrence = addDays(firstDayOfLatestOccurringWeek, calculateWeeklyDayOffset(sortedDaysOfWeek.at(-1)!, pattern.firstDayOfWeek!));
        return {
            previousOccurrence: previousOccurrence,
            numberOfOccurrences: numberOfOccurrences
        };
    }

    let dayWithMinOffset = addDays(firstDayOfLatestOccurringWeek, calculateWeeklyDayOffset(sortedDaysOfWeek[0], pattern.firstDayOfWeek!));
    if (dayWithMinOffset < startTime) {
        numberOfOccurrences = 0;
        dayWithMinOffset = startTime;
    }
    let previousOccurrence;
    if (time >= dayWithMinOffset) {
        // the previous occurence is the day with max offset less than current
        previousOccurrence = dayWithMinOffset;
        numberOfOccurrences += 1;
        const dayWithMinOffsetIndex = sortedDaysOfWeek.indexOf(getDayOfWeek(dayWithMinOffset, recurrenceSpec.timezoneOffset));
        for (let i = dayWithMinOffsetIndex + 1; i < sortedDaysOfWeek.length; i++) {
            const day = addDays(firstDayOfLatestOccurringWeek, calculateWeeklyDayOffset(sortedDaysOfWeek[i], pattern.firstDayOfWeek!));
            if (time < day) {
                break;
            }
            previousOccurrence = day;
            numberOfOccurrences += 1;
        }
    } else {
        const firstDayOfPreviousOccurringWeek = addDays(firstDayOfLatestOccurringWeek, -pattern.interval * DAYS_PER_WEEK);
        // the previous occurence is the day with the max offset of previous occurring week
        previousOccurrence = addDays(firstDayOfPreviousOccurringWeek, calculateWeeklyDayOffset(sortedDaysOfWeek.at(-1)!, pattern.firstDayOfWeek!));
    }
    return {
        previousOccurrence: previousOccurrence,
        numberOfOccurrences: numberOfOccurrences
    };
}
