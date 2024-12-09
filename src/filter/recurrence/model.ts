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

export enum RecurrencePatternType {
    Daily,
    Weekly
}

export enum RecurrenceRangeType {
    NoEnd,
    EndDate,
    Numbered
}

export type RecurrencePattern = {
    Type: RecurrencePatternType;
    Interval: number;
    DaysOfWeek?: DayOfWeek[];
    FirstDayOfWeek?: DayOfWeek;
};

export type RecurrenceRange = {
    Type: RecurrenceRangeType;
    EndDate?: Date;
    NumberOfOccurrences?: number;
};

export type Recurrence = {
    StartTime: Date;
    EndTime: Date;
    Pattern: RecurrencePattern;
    Range: RecurrenceRange;
    TimeZoneOffset: number;
};
