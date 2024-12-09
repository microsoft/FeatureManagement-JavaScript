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
