// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export const DAYS_PER_WEEK = 7;
export const ONE_DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

export enum DayOfWeek {
    Sunday = 0,
    Monday = 1,
    Tuesday = 2,
    Wednesday = 3,
    Thursday = 4,
    Friday = 5,
    Saturday = 6
}

/**
 * The recurrence pattern describes the frequency by which the time window repeats
 */
export enum RecurrencePatternType {
    /**
     * The pattern where the time window will repeat based on the number of days specified by interval between occurrences
     */
    Daily,
    /**
     * The pattern where the time window will repeat on the same day or days of the week, based on the number of weeks between each set of occurrences
     */
    Weekly
}

/**
 * The recurrence range specifies the date range over which the time window repeats
 */
export enum RecurrenceRangeType {
    /**
     * The recurrence has no end and repeats on all the days that fit the corresponding pattern
     */
    NoEnd,
    /**
     * The recurrence repeats on all the days that fit the corresponding pattern until or on the specified end date
     */
    EndDate,
    /**
     * The recurrence repeats for the specified number of occurrences that match the pattern
     */
    Numbered
}

/**
 * The recurrence pattern describes the frequency by which the time window repeats
 */
export type RecurrencePattern = {
    /**
     * The type of the recurrence pattern
     */
    type: RecurrencePatternType;
    /**
     * The number of units between occurrences, where units can be in days or weeks, depending on the pattern type
     */
    interval: number;
    /**
     * The days of the week when the time window occurs, which is only applicable for 'Weekly' pattern
     */
    daysOfWeek?: DayOfWeek[];
    /**
     * The first day of the week, which is only applicable for 'Weekly' pattern
     */
    firstDayOfWeek?: DayOfWeek;
};

/**
 * The recurrence range describes a date range over which the time window repeats
 */
export type RecurrenceRange = {
    /**
     * The type of the recurrence range
     */
    type: RecurrenceRangeType;
    /**
     * The date to stop applying the recurrence pattern, which is only applicable for 'EndDate' range
     */
    endDate?: Date;
    /**
     * The number of times to repeat the time window, which is only applicable for 'Numbered' range
     */
    numberOfOccurrences?: number;
};

/**
 * Specification defines the recurring time window
 */
export type RecurrenceSpec = {
    /**
     * The start time of the first/base time window
     */
    startTime: Date;
    /**
     * The duration of each time window in milliseconds
     */
    duration: number;
    /**
     * The recurrence pattern
     */
    pattern: RecurrencePattern;
    /**
     * The recurrence range
     */
    range: RecurrenceRange;
    /**
     * The timezone offset in milliseconds, which helps to determine the day of week of a given date
     */
    timezoneOffset: number;
};
