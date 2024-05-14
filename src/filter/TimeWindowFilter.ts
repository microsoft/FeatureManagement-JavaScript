// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { IFeatureFilter } from "./FeatureFilter";


type DayOfWeekString =
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday"

class DayOfWeek {
    static Sunday = new DayOfWeek("Sunday", 0);
    static Monday = new DayOfWeek("Monday", 1);
    static Tuesday = new DayOfWeek("Tuesday", 2);
    static Wednesday = new DayOfWeek("Wednesday", 3);
    static Thursday = new DayOfWeek("Thursday", 4);
    static Friday = new DayOfWeek("Friday", 5);
    static Saturday = new DayOfWeek("Saturday", 6);

    static readonly #days = [this.Sunday, this.Monday, this.Tuesday, this.Wednesday, this.Thursday, this.Friday, this.Saturday];

    private constructor(public name: string, public index: number) { }

    static getDayByName(dayOfWeek: DayOfWeekString): DayOfWeek {
        return this[dayOfWeek];
    }

    static getDayByIndex(index: number): DayOfWeek {
        return this.#days[index];
    }
}


type TimeWindowFilterRecurrenceRangeType =
    | "NoEnd"
    | "EndDate"
    | "Numbered"

interface TimeWindowFilterRecurrence {
    Pattern?: TimeWindowFilterRecurrencePattern
    Range?: {
        Type: TimeWindowFilterRecurrenceRangeType
        EndDate?: string;
        NumberOfOccurrences?: number;
    }
}

interface TimeWindowFilterRecurrencePattern {
    Type: "Daily" | "Weekly";
    Interval?: number;
    DaysOfWeek?: DayOfWeekString[];
    FirstDayOfWeek?: DayOfWeekString;
}

interface TimeWindowFilterParameters {
    Start?: string;
    End?: string;
    Recurrence?: TimeWindowFilterRecurrence;
}

type TimeWindowFilterEvaluationContext = {
    featureName: string;
    parameters: TimeWindowFilterParameters;
}

type Occurrence = {
    start: Date;
    numberOfOccurrences: number;
}

export class TimeWindowFilter implements IFeatureFilter {
    name: string = "Microsoft.TimeWindow";

    evaluate(context: TimeWindowFilterEvaluationContext): boolean {
        const { featureName, parameters } = context;
        const startTime = parameters.Start !== undefined ? new Date(parameters.Start) : undefined;
        const endTime = parameters.End !== undefined ? new Date(parameters.End) : undefined;

        if (startTime === undefined && endTime === undefined) {
            // If neither start nor end time is specified, then the filter is not applicable.
            console.warn(`The ${this.name} feature filter is not valid for feature ${featureName}. It must specify either 'Start', 'End', or both.`);
            return false;
        }
        const now = new Date();

        // Hit the first occurrence of the time window
        if ((startTime === undefined || startTime <= now) && (endTime === undefined || now < endTime)) {
            return true;
        }

        if (parameters.Recurrence !== undefined) {
            const recurrenceEval = new RecurrenceEvaluator(parameters);
            return recurrenceEval.isMatch(now);
        }

        return false;
    }
}

class RecurrenceEvaluator {

    #start: Date;
    #end: Date;
    #recurrence: TimeWindowFilterRecurrence;

    constructor(private parameters: TimeWindowFilterParameters) {
        if (parameters.Start === undefined
            || parameters.End === undefined
            || parameters.Recurrence === undefined
        ) {
            throw new Error("The recurrence filter must specify both 'Start' and 'End'.");
        }
        this.#start = new Date(parameters.Start);
        this.#end = new Date(parameters.End);
        this.#recurrence = parameters.Recurrence;
    }

    isMatch(now: Date): boolean {
        if (now < this.#start) {
            return false;
        }

        const prevOccur = this.#findPreviousOccurrence(now);
        if (prevOccur) {
            return now.getTime() < prevOccur.start.getTime() + (this.#end.getTime() - this.#start.getTime());
        }

        return false;
    }

    /**
     * Find the previous occurrence of the time window.
     * @param now The given time.
     * @returns  The previous occurrence of the time window.
     */
    #findPreviousOccurrence(now: Date): Occurrence | undefined{
        let prevOccurrence;

        switch (this.#recurrence.Pattern?.Type) {
            case "Daily":
                prevOccurrence = findPreviousDailyOccurrence(now, this.#start, this.#recurrence.Pattern);
                break;
            case "Weekly":
                prevOccurrence = findPreviousWeeklyOccurrence(now, this.#start, this.#recurrence.Pattern);
                break;
            default:
                return undefined;
        }

        const range = this.#recurrence.Range;
        switch (range?.Type) {
            case "EndDate":
                if (prevOccurrence.start.getTime() < new Date(range.EndDate!).getTime()) {
                    return prevOccurrence;
                } else {
                    return undefined;
                }
            case "Numbered":
                if (prevOccurrence.numberOfOccurrences <= range.NumberOfOccurrences!) {
                    return prevOccurrence;
                } else {
                    return undefined;
                }
            default:
                break;
        }
        return prevOccurrence;
    }

}

function findPreviousDailyOccurrence(now: Date, start: Date, pattern: TimeWindowFilterRecurrencePattern): Occurrence {
    const timeGap = now.getTime() - start.getTime();
    const intervalInDay = pattern.Interval ?? 1;
    const numberOfInterval = Math.floor(timeGap / (intervalInDay * 24 * 60 * 60 * 1000));

    const nextOccurrenceStart = addDays(start, numberOfInterval * intervalInDay);
    return {
        start: nextOccurrenceStart,
        numberOfOccurrences: numberOfInterval + 1
    }
}

function findPreviousWeeklyOccurrence(now: Date, start: Date, pattern: TimeWindowFilterRecurrencePattern): Occurrence {
    const firstDayOfWeek = DayOfWeek.getDayByName(pattern.FirstDayOfWeek ?? "Sunday"); // default to Sunday

    const dayOfWeekOffset = getOffset(start.getDay(), firstDayOfWeek.index);
    const firstDayOfStartWeek = addDays(start, -dayOfWeekOffset);

    const intervalInWeek = pattern.Interval ?? 1;
    const numberOfInterval = Math.floor((now.getTime() - firstDayOfStartWeek.getTime()) / (intervalInWeek * 7 * 24 * 60 * 60 * 1000));

    const firstDayOfMostRecentOccurringWeek = addDays(firstDayOfStartWeek, numberOfInterval * intervalInWeek * 7);

    // sort recurrence days of week, because it can be in any order
    // TODO: what if daysOfWeek is not defined, @zhiyuanliang-ms should we throw an error or regard it as []?
    const recurredDaysOfWeek = (pattern.DaysOfWeek ?? []).map((day) => DayOfWeek.getDayByName(day));
    recurredDaysOfWeek.sort((a, b) => a.index - b.index);

    // Subtract the days before the start in the first week.
    let numberOfOccurrences = numberOfInterval * recurredDaysOfWeek.length - recurredDaysOfWeek.indexOf(DayOfWeek.getDayByIndex(start.getDay()));

    // The current time is not within the most recent occurring week.
    if (now.getTime() - firstDayOfMostRecentOccurringWeek.getTime() > 7 * 24 * 60 * 60 * 1000) {
        numberOfOccurrences += recurredDaysOfWeek.length;

        // day with max offset in the most recent occurring week
        const previousOccurrence = addDays(firstDayOfMostRecentOccurringWeek, getOffset(recurredDaysOfWeek[recurredDaysOfWeek.length - 1], firstDayOfWeek));
        return {
            start: previousOccurrence,
            numberOfOccurrences
        }
    }

    // day with the min offset in the most recent occurring week
    let dayWithMinOffset = addDays(firstDayOfMostRecentOccurringWeek, getOffset(recurredDaysOfWeek[0], firstDayOfWeek));
    if (dayWithMinOffset.getTime() < start.getTime()) {
        numberOfOccurrences = 0;
        dayWithMinOffset = start;
    }

    if (now.getTime() >= dayWithMinOffset.getTime()) {
        let previousOccurrence = dayWithMinOffset;
        numberOfOccurrences++;

        // Find the day with the max offset that is less than the current time.
        for (let i = recurredDaysOfWeek.indexOf(DayOfWeek.getDayByIndex(dayWithMinOffset.getDay())) + 1; i < recurredDaysOfWeek.length; i++) {
            const day = recurredDaysOfWeek[i];
            const currentOccurrence = addDays(dayWithMinOffset, getOffset(day, recurredDaysOfWeek[0]));
            if (now.getTime() >= currentOccurrence.getTime()) {
                previousOccurrence = currentOccurrence;
                numberOfOccurrences++;
            } else {
                break;
            }
        }

        return {
            start: previousOccurrence,
            numberOfOccurrences
        }
    } else {
        // the previous occurring week
        const firstDayOfPreviousOccurringWeek = addDays(firstDayOfMostRecentOccurringWeek, -intervalInWeek * 7);
        // day with max offset in the last occurring week
        const previousOccurrence = addDays(firstDayOfPreviousOccurringWeek, getOffset(recurredDaysOfWeek[recurredDaysOfWeek.length - 1], firstDayOfWeek));
        return {
            start: previousOccurrence,
            numberOfOccurrences
        }
    }
}

function getOffset(dayOfWeek1: number | DayOfWeekString | DayOfWeek, dayOfWeek2: number | DayOfWeekString | DayOfWeek) {
    let index1: number, index2 : number;

    if (typeof dayOfWeek1 === "number") {
        index1 = dayOfWeek1;
    } else if (typeof dayOfWeek1 === "string") {
        index1 = DayOfWeek.getDayByName(dayOfWeek1 as DayOfWeekString).index;
    } else {
        index1 = (dayOfWeek1 as DayOfWeek).index;
    }

    if (typeof dayOfWeek2 === "number") {
        index2 = dayOfWeek2;
    } else if (typeof dayOfWeek2 === "string") {
        index2 = DayOfWeek.getDayByName(dayOfWeek2 as DayOfWeekString).index;
    } else {
        index2 = (dayOfWeek2 as DayOfWeek).index;
    }

    return (index1 - index2 + 7) % 7;
}

function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}
