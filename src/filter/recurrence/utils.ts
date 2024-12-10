// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { DayOfWeek, DAYS_PER_WEEK } from "./model.js";

/**
 * Calculates the offset in days between two given days of the week.
 * @param day1 A day of week
 * @param day2 A day of week
 * @returns The number of days to be added to day2 to reach day1
 */
export function calculateWeeklyDayOffset(day1: DayOfWeek, day2: DayOfWeek): number {
    return (day1 - day2 + DAYS_PER_WEEK) % DAYS_PER_WEEK;
}

/**
 * Sorts a collection of days of week based on their offsets from a specified first day of week.
 * @param daysOfWeek A collection of days of week
 * @param firstDayOfWeek The first day of week which will be the first element in the sorted result
 * @returns The sorted days of week
 */
export function sortDaysOfWeek(daysOfWeek: DayOfWeek[], firstDayOfWeek: DayOfWeek): DayOfWeek[] {
    const sortedDaysOfWeek = daysOfWeek.slice();
    sortedDaysOfWeek.sort((x, y) => calculateWeeklyDayOffset(x, firstDayOfWeek) - calculateWeeklyDayOffset(y, firstDayOfWeek));
    return sortedDaysOfWeek;
}

/**
 * Gets the day of week of a given date based on the timezone offset.
 * @param date A UTC date
 * @param timezoneOffset The timezone offset in milliseconds
 * @returns The day of week (0 for Sunday, 1 for Monday, ..., 6 for Saturday)
 */
export function getDayOfWeek(date: Date, timezoneOffset: number): number {
    const alignedDate = new Date(date.getTime() + timezoneOffset);
    return alignedDate.getUTCDay();
}

/**
 * Adds a specified number of days to a given date.
 * @param date The date to add days to
 * @param days The number of days to add
 * @returns The new date
 */
export function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}
