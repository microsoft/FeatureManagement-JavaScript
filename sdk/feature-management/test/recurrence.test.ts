// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const expect = chai.expect;

import {
    parseRecurrenceParameter,
    PATTERN,
    PATTERN_TYPE,
    INTERVAL,
    DAYS_OF_WEEK,
    FIRST_DAY_OF_WEEK,
    RANGE,
    RANGE_TYPE,
    END_DATE,
    NUMBER_OF_OCCURRENCES,
    START_NOT_MATCHED_ERROR_MESSAGE,
    TIME_WINDOW_DURATION_OUT_OF_RANGE_ERROR_MESSAGE } from "../src/filter/recurrence/validator.js";
import { VALUE_OUT_OF_RANGE_ERROR_MESSAGE, UNRECOGNIZABLE_VALUE_ERROR_MESSAGE, REQUIRED_PARAMETER_MISSING_ERROR_MESSAGE, buildInvalidParameterErrorMessage } from "../src/filter/utils.js";
import { DayOfWeek, RecurrencePatternType, RecurrenceRangeType } from "../src/filter/recurrence/model";
import { matchRecurrence } from "../src/filter/recurrence/evaluator.js";

describe("recurrence validator", () => {
    it("should check general required parameter", () => {
        const recurrence1 = {
            Pattern: {
                Type: "Daily"
            },
            Range: {
                Type: "NoEnd"
            }
        };
        expect(() => parseRecurrenceParameter(undefined, new Date(), recurrence1)).to.throw(buildInvalidParameterErrorMessage("Start", REQUIRED_PARAMETER_MISSING_ERROR_MESSAGE));
        expect(() => parseRecurrenceParameter(new Date(), undefined, recurrence1)).to.throw(buildInvalidParameterErrorMessage("End", REQUIRED_PARAMETER_MISSING_ERROR_MESSAGE));
        const recurrence2 = {
            Range: {
                Type: "NoEnd"
            }
        };
        expect(() => parseRecurrenceParameter(new Date(1), new Date(2), recurrence2 as any)).to.throw(buildInvalidParameterErrorMessage(PATTERN, REQUIRED_PARAMETER_MISSING_ERROR_MESSAGE));
        const recurrence3 = {
            Pattern: {
                Type: "Daily"
            }
        };
        expect(() => parseRecurrenceParameter(new Date(1), new Date(2), recurrence3 as any)).to.throw(buildInvalidParameterErrorMessage(RANGE, REQUIRED_PARAMETER_MISSING_ERROR_MESSAGE));
    });

    it("should check pattern and range required parameter", () => {
        const recurrence1 = {
            Pattern: {},
            Range: {
                Type: "NoEnd"
            }
        };
        expect(() => parseRecurrenceParameter(new Date(1), new Date(2), recurrence1 as any)).to.throw(buildInvalidParameterErrorMessage(PATTERN_TYPE, REQUIRED_PARAMETER_MISSING_ERROR_MESSAGE));
        const recurrence2 = {
            Pattern: {
                Type: "Weekly"
            },
            Range: {
                Type: "NoEnd"
            }
        };
        expect(() => parseRecurrenceParameter(new Date(1), new Date(2), recurrence2)).to.throw(buildInvalidParameterErrorMessage(DAYS_OF_WEEK, REQUIRED_PARAMETER_MISSING_ERROR_MESSAGE));
        const recurrence3 = {
            Pattern: {
                Type: "Weekly",
                DaysOfWeek: []
            },
            Range: {
                Type: "NoEnd"
            }
        };
        expect(() => parseRecurrenceParameter(new Date(1), new Date(2), recurrence3)).to.throw(buildInvalidParameterErrorMessage(DAYS_OF_WEEK, REQUIRED_PARAMETER_MISSING_ERROR_MESSAGE));
        const recurrence4 = {
            Pattern: {
                Type: "Daily"
            },
            Range: {}
        };
        expect(() => parseRecurrenceParameter(new Date(1), new Date(2), recurrence4 as any)).to.throw(buildInvalidParameterErrorMessage(RANGE_TYPE, REQUIRED_PARAMETER_MISSING_ERROR_MESSAGE));

    });

    it("should check invalid value", () => {
        const recurrence1 = {
            Pattern: {
                Type: "Daily",
                Interval: "1"
            },
            Range: {
                Type: "NoEnd"
            }
        };
        expect(() => parseRecurrenceParameter(new Date(1), new Date(2), recurrence1 as any)).to.throw(buildInvalidParameterErrorMessage(INTERVAL, UNRECOGNIZABLE_VALUE_ERROR_MESSAGE));
        const recurrence2 = {
            Pattern: {
                Type: "Daily",
                Interval: 0
            },
            Range: {
                Type: "NoEnd"
            }
        };
        expect(() => parseRecurrenceParameter(new Date(1), new Date(2), recurrence2)).to.throw(buildInvalidParameterErrorMessage(INTERVAL, VALUE_OUT_OF_RANGE_ERROR_MESSAGE));
        const recurrence3 = {
            Pattern: {
                Type: "Daily"
            },
            Range: {
                Type: "Numbered",
                NumberOfOccurrences: "1"
            }
        };
        expect(() => parseRecurrenceParameter(new Date(1), new Date(2), recurrence3 as any)).to.throw(buildInvalidParameterErrorMessage(NUMBER_OF_OCCURRENCES, UNRECOGNIZABLE_VALUE_ERROR_MESSAGE));
        const recurrence4 = {
            Pattern: {
                Type: "Daily"
            },
            Range: {
                Type: "Numbered",
                NumberOfOccurrences: 0
            }
        };
        expect(() => parseRecurrenceParameter(new Date(1), new Date(2), recurrence4)).to.throw(buildInvalidParameterErrorMessage(NUMBER_OF_OCCURRENCES, VALUE_OUT_OF_RANGE_ERROR_MESSAGE));
        const recurrence5 = {
            Pattern: {
                Type: "Weekly",
                DaysOfWeek: ["Monday", "Tue"]
            },
            Range: {
                Type: "NoEnd"
            }
        };
        expect(() => parseRecurrenceParameter(new Date(1), new Date(2), recurrence5)).to.throw(buildInvalidParameterErrorMessage(DAYS_OF_WEEK, UNRECOGNIZABLE_VALUE_ERROR_MESSAGE));
        const recurrence6 = {
            Pattern: {
                Type: "Weekly",
                DaysOfWeek: "Monday"
            },
            Range: {
                Type: "NoEnd"
            }
        };
        expect(() => parseRecurrenceParameter(new Date(1), new Date(2), recurrence6 as any)).to.throw(buildInvalidParameterErrorMessage(DAYS_OF_WEEK, UNRECOGNIZABLE_VALUE_ERROR_MESSAGE));
        const recurrence7 = {
            Pattern: {
                Type: "Weekly",
                DaysOfWeek: ["Monday"],
                FirstDayOfWeek: "Mon"
            },
            Range: {
                Type: "NoEnd"
            }
        };
        expect(() => parseRecurrenceParameter(new Date(1), new Date(2), recurrence7)).to.throw(buildInvalidParameterErrorMessage(FIRST_DAY_OF_WEEK, UNRECOGNIZABLE_VALUE_ERROR_MESSAGE));
        const recurrence8 = {
            Pattern: {
                Type: "Daily"
            },
            Range: {
                Type: "EndDate",
                EndDate: "AppConfig"
            }
        };
        expect(() => parseRecurrenceParameter(new Date(1), new Date(2), recurrence8)).to.throw(buildInvalidParameterErrorMessage(END_DATE, UNRECOGNIZABLE_VALUE_ERROR_MESSAGE));
        const recurrence9 = {
            Pattern: {
                Type: "Daily"
            },
            Range: {
                Type: "EndDate",
                EndDate: "2024-12-10T00:00:00+0000"
            }
        };
        expect(() => parseRecurrenceParameter(new Date("2024-12-11T00:00:00+0000"), new Date("2024-12-11T00:00:01+0000"), recurrence9)).to.throw(buildInvalidParameterErrorMessage(END_DATE, VALUE_OUT_OF_RANGE_ERROR_MESSAGE));
    });

    it("should check time window duration", () => {
        const recurrence1 = {
            Pattern: {
                Type: "Daily"
            },
            Range: {
                Type: "NoEnd"
            }
        };
        expect(() => parseRecurrenceParameter(new Date(2), new Date(1), recurrence1)).to.throw(buildInvalidParameterErrorMessage("End", VALUE_OUT_OF_RANGE_ERROR_MESSAGE));
        const recurrence2 = {
            Pattern: {
                Type: "Daily"
            },
            Range: {
                Type: "NoEnd"
            }
        };
        expect(() => parseRecurrenceParameter(new Date("2024-12-10T00:00:00+0000"), new Date("2024-12-12T00:00:00+0000"), recurrence2)).to.throw(buildInvalidParameterErrorMessage("End", TIME_WINDOW_DURATION_OUT_OF_RANGE_ERROR_MESSAGE));
        const recurrence3 = {
            Pattern: {
                Type: "Weekly",
                DaysOfWeek: ["Monday"]
            },
            Range: {
                Type: "NoEnd"
            }
        };
        expect(() => parseRecurrenceParameter(new Date("2024-12-09T00:00:00+0000"), new Date("2024-12-16T00:00:01+0000"), recurrence3)).to.throw(buildInvalidParameterErrorMessage("End", TIME_WINDOW_DURATION_OUT_OF_RANGE_ERROR_MESSAGE));
        const recurrence4 = {
            Pattern: {
                Type: "Weekly",
                DaysOfWeek: ["Monday", "Thursday", "Sunday"]
            },
            Range: {
                Type: "NoEnd"
            }
        };
        expect(() => parseRecurrenceParameter(new Date("2024-12-09T00:00:00+0000"), new Date("2024-12-11T00:00:01+0000"), recurrence4)).to.throw(buildInvalidParameterErrorMessage("End", TIME_WINDOW_DURATION_OUT_OF_RANGE_ERROR_MESSAGE));
        const recurrence5 = {
            Pattern: {
                Type: "Weekly",
                DaysOfWeek: ["Monday", "Saturday"]
            },
            Range: {
                Type: "NoEnd"
            }
        };
        expect(() => parseRecurrenceParameter(new Date("2024-12-09T00:00:00+0000"), new Date("2024-12-11T00:00:01+0000"), recurrence5)).to.throw(buildInvalidParameterErrorMessage("End", TIME_WINDOW_DURATION_OUT_OF_RANGE_ERROR_MESSAGE));
        const recurrence6 = {
            Pattern: {
                Type: "Weekly",
                DaysOfWeek: ["Tuesday", "Saturday"]
            },
            Range: {
                Type: "NoEnd"
            }
        };
        expect(() => parseRecurrenceParameter(new Date("2024-01-16T00:00:00+0000"), new Date("2024-01-19T00:00:00+0000"), recurrence6)).to.not.throw();
        const recurrence7 = {
            Pattern: {
                Type: "Weekly",
                Interval: 2,
                DaysOfWeek: ["Monday", "Sunday"],
                FirstDayOfWeek: "Monday"
            },
            Range: {
                Type: "NoEnd"
            }
        };
        expect(() => parseRecurrenceParameter(new Date("2024-01-15T00:00:00+0000"), new Date("2024-01-19T00:00:00+0000"), recurrence7)).to.not.throw();
        const recurrence8 = {
            Pattern: {
                Type: "Weekly",
                Interval: 1,
                DaysOfWeek: ["Monday", "Saturday"],
                FirstDayOfWeek: "Sunday"
            },
            Range: {
                Type: "NoEnd"
            }
        };
        expect(() => parseRecurrenceParameter(new Date("2024-01-15T00:00:00+0000"), new Date("2024-01-17T00:00:00+0000"), recurrence8)).to.not.throw();
        expect(() => parseRecurrenceParameter(new Date("2024-01-15T00:00:00+0000"), new Date("2024-01-17T00:00:01+0000"), recurrence8)).to.throw(buildInvalidParameterErrorMessage("End", TIME_WINDOW_DURATION_OUT_OF_RANGE_ERROR_MESSAGE));
        const recurrence9 = {
            Pattern: {
                Type: "Weekly",
                Interval: 1,
                DaysOfWeek: ["Monday", "Sunday"],
                FirstDayOfWeek: "Monday"
            },
            Range: {
                Type: "NoEnd"
            }
        };
        expect(() => parseRecurrenceParameter(new Date("2024-01-15T00:00:00+0000"), new Date("2024-01-19T00:00:00+0000"), recurrence9)).to.throw(buildInvalidParameterErrorMessage("End", TIME_WINDOW_DURATION_OUT_OF_RANGE_ERROR_MESSAGE));
    });

    it("should check whether start is a valid first occurrence", () => {
        const recurrence1 = {
            Pattern: {
                Type: "Weekly",
                DaysOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Saturday", "Sunday"]
            },
            Range: {
                Type: "NoEnd"
            }
        };
        expect(() => parseRecurrenceParameter(
            new Date("2023-09-01T00:00:00+08:00"),
            new Date("2023-09-01T00:00:01+08:00"),
            recurrence1,
            8 * 24 * 60 * 60 * 1000)
        ).to.throw(buildInvalidParameterErrorMessage("Start", START_NOT_MATCHED_ERROR_MESSAGE));
    });
});

describe("recurrence evaluator", () => {
    it("should match daily recurrence", () => {
        const spec1 = {
            startTime: new Date("2023-09-01T00:00:00+08:00"),
            duration: 1000,
            pattern: {type: RecurrencePatternType.Daily, interval: 1},
            range: {type: RecurrenceRangeType.NoEnd}
        };
        expect(matchRecurrence(new Date("2023-09-02T00:00:00+08:00"), spec1 as any)).to.be.true;
        const spec2 = {
            startTime: new Date("2023-09-01T00:00:00+08:00"),
            duration: 1000,
            pattern: {type: RecurrencePatternType.Daily, interval: 2},
            range: {type: RecurrenceRangeType.NoEnd}
        };
        expect(matchRecurrence(new Date("2023-09-02T00:00:00+08:00"), spec2 as any)).to.be.false;
        expect(matchRecurrence(new Date("2023-09-03T00:00:00+08:00"), spec2 as any)).to.be.true;
        const spec3 = {
            startTime: new Date("2023-09-01T00:00:00+08:00"),
            duration: 2 * 24 * 60 * 60 * 1000,
            pattern: {type: RecurrencePatternType.Daily, interval: 4},
            range: {type: RecurrenceRangeType.NoEnd}
        };
        expect(matchRecurrence(new Date("2023-09-05T00:00:00+08:00"), spec3 as any)).to.be.true;
        expect(matchRecurrence(new Date("2023-09-06T00:00:00+08:00"), spec3 as any)).to.be.true;
        expect(matchRecurrence(new Date("2023-09-09T00:00:00+08:00"), spec3 as any)).to.be.true;
        const spec4 = {
            startTime: new Date("2023-09-01T00:00:00+08:00"),
            duration: 1000,
            pattern: {type: RecurrencePatternType.Daily, interval: 1},
            range: {type: RecurrenceRangeType.Numbered, numberOfOccurrences: 2}
        };
        expect(matchRecurrence(new Date("2023-09-02T00:00:00+08:00"), spec4 as any)).to.be.true;
        expect(matchRecurrence(new Date("2023-09-03T00:00:00+08:00"), spec4 as any)).to.be.false;
        const spec5 = {
            startTime: new Date("2023-09-01T00:00:00+08:00"),
            duration: 1000,
            pattern: {type: RecurrencePatternType.Daily, interval: 1},
            range: {type: RecurrenceRangeType.EndDate, endDate: new Date("2023-09-03T00:00:00+08:00")}
        };
        expect(matchRecurrence(new Date("2023-09-04T00:00:00+08:00"), spec5 as any)).to.be.false;
        const spec6 = {
            startTime: new Date("2023-09-01T00:00:00+08:00"),
            duration: 12 * 60 * 60 * 1000 + 1000,
            pattern: {type: RecurrencePatternType.Daily, interval: 2},
            range: {type: RecurrenceRangeType.NoEnd}
        };
        expect(matchRecurrence(new Date("2023-09-02T16:00:00+0000"), spec6 as any)).to.be.true;
        expect(matchRecurrence(new Date("2023-09-02T15:59:59+0000"), spec6 as any)).to.be.false;
    });
    it("should match weekly recurrence", () => {
        const spec1 = {
            startTime: new Date("2023-09-01T00:00:00+08:00"),
            duration: 1000,
            pattern: {
                type: RecurrencePatternType.Weekly,
                interval: 1,
                daysOfWeek: [DayOfWeek.Monday, DayOfWeek.Friday],
                firstDayOfWeek: DayOfWeek.Sunday
            },
            range: {type: RecurrenceRangeType.NoEnd},
            timezoneOffset: 8 * 60 * 60 * 1000
        };
        expect(matchRecurrence(new Date("2023-09-04T00:00:00+08:00"), spec1)).to.be.true;
        expect(matchRecurrence(new Date("2023-09-08T00:00:00+08:00"), spec1)).to.be.true;
        const spec2 = {
            startTime: new Date("2023-09-01T00:00:00+08:00"),
            duration: 1000,
            pattern: {
                type: RecurrencePatternType.Weekly,
                interval: 2,
                daysOfWeek: [DayOfWeek.Friday],
                firstDayOfWeek: DayOfWeek.Sunday
            },
            range: {type: RecurrenceRangeType.NoEnd},
            timezoneOffset: 8 * 60 * 60 * 1000
        };
        expect(matchRecurrence(new Date("2023-09-08T00:00:00+08:00"), spec2)).to.be.false;
        expect(matchRecurrence(new Date("2023-09-15T00:00:00+08:00"), spec2)).to.be.true;
        const spec3 = {
            startTime: new Date("2023-09-01T00:00:00+08:00"),
            duration: 1000,
            pattern: {
                type: RecurrencePatternType.Weekly,
                interval: 1,
                daysOfWeek: [DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday, DayOfWeek.Saturday, DayOfWeek.Sunday],
                firstDayOfWeek: DayOfWeek.Sunday
            },
            range: {type: RecurrenceRangeType.NoEnd},
            timezoneOffset: 8 * 60 * 60 * 1000
        };
        expect(matchRecurrence(new Date("2023-09-04T00:00:00+08:00"), spec3)).to.be.false;
        const spec4 = {
            startTime: new Date("2023-09-01T00:00:00+08:00"),
            duration: 1000,
            pattern: {
                type: RecurrencePatternType.Weekly,
                interval: 1,
                daysOfWeek: [DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday, DayOfWeek.Saturday, DayOfWeek.Sunday],
                firstDayOfWeek: DayOfWeek.Sunday
            },
            range: {type: RecurrenceRangeType.Numbered, numberOfOccurrences: 1},
            timezoneOffset: 8 * 60 * 60 * 1000
        };
        expect(matchRecurrence(new Date("2023-09-02T00:00:00+08:00"), spec4)).to.be.false;
        const spec5 = {
            startTime: new Date("2023-09-01T00:00:00+08:00"),
            duration: 1000,
            pattern: {
                type: RecurrencePatternType.Weekly,
                interval: 1,
                daysOfWeek: [DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday, DayOfWeek.Saturday, DayOfWeek.Sunday],
                firstDayOfWeek: DayOfWeek.Sunday
            },
            range: {type: RecurrenceRangeType.Numbered, numberOfOccurrences: 2},
            timezoneOffset: 8 * 60 * 60 * 1000
        };
        expect(matchRecurrence(new Date("2023-09-03T00:00:00+08:00"), spec5)).to.be.false;
        const spec6 = {
            startTime: new Date("2023-09-01T00:00:00+08:00"),
            duration: 1000,
            pattern: {
                type: RecurrencePatternType.Weekly,
                interval: 1,
                daysOfWeek: [DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday, DayOfWeek.Saturday, DayOfWeek.Sunday],
                firstDayOfWeek: DayOfWeek.Sunday
            },
            range: {type: RecurrenceRangeType.Numbered, numberOfOccurrences: 3},
            timezoneOffset: 8 * 60 * 60 * 1000
        };
        expect(matchRecurrence(new Date("2023-09-03T00:00:00+08:00"), spec6)).to.be.true;
        const spec7 = {
            startTime: new Date("2023-09-01T00:00:00+08:00"),
            duration: 1000,
            pattern: {
                type: RecurrencePatternType.Weekly,
                interval: 1,
                daysOfWeek: [DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday, DayOfWeek.Saturday, DayOfWeek.Sunday],
                firstDayOfWeek: DayOfWeek.Sunday
            },
            range: {type: RecurrenceRangeType.Numbered, numberOfOccurrences: 7},
            timezoneOffset: 8 * 60 * 60 * 1000
        };
        expect(matchRecurrence(new Date("2023-09-08T00:00:00+08:00"), spec7)).to.be.false;
        const spec8 = {
            startTime: new Date("2023-09-01T00:00:00+08:00"),
            duration: 1000,
            pattern: {
                type: RecurrencePatternType.Weekly,
                interval: 1,
                daysOfWeek: [DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday, DayOfWeek.Saturday, DayOfWeek.Sunday],
                firstDayOfWeek: DayOfWeek.Sunday
            },
            range: {type: RecurrenceRangeType.Numbered, numberOfOccurrences: 8},
            timezoneOffset: 8 * 60 * 60 * 1000
        };
        expect(matchRecurrence(new Date("2023-09-08T00:00:00+08:00"), spec8)).to.be.true;
        const spec9 = {
            startTime: new Date("2024-01-04T00:00:00+08:00"),
            duration: 60 * 60 * 1000,
            pattern: {
                type: RecurrencePatternType.Weekly,
                interval: 2,
                daysOfWeek: [DayOfWeek.Tuesday, DayOfWeek.Thursday, DayOfWeek.Friday],
                firstDayOfWeek: DayOfWeek.Sunday
            },
            range: {type: RecurrenceRangeType.Numbered, numberOfOccurrences: 3},
            timezoneOffset: 8 * 60 * 60 * 1000
        };
        expect(matchRecurrence(new Date("2024-01-18T00:30:00+08:00"), spec9)).to.be.false;
        const spec10 = {
            startTime: new Date("2024-01-04T00:00:00+08:00"),
            duration: 60 * 60 * 1000,
            pattern: {
                type: RecurrencePatternType.Weekly,
                interval: 2,
                daysOfWeek: [DayOfWeek.Tuesday, DayOfWeek.Thursday, DayOfWeek.Friday],
                firstDayOfWeek: DayOfWeek.Sunday
            },
            range: {type: RecurrenceRangeType.Numbered, numberOfOccurrences: 4},
            timezoneOffset: 8 * 60 * 60 * 1000
        };
        expect(matchRecurrence(new Date("2024-01-18T00:30:00+08:00"), spec10)).to.be.true;
        const spec11 = {
            startTime: new Date("2023-09-03T00:00:00+08:00"),
            duration: 1000,
            pattern: {
                type: RecurrencePatternType.Weekly,
                interval: 2,
                daysOfWeek: [DayOfWeek.Sunday, DayOfWeek.Monday],
                firstDayOfWeek: DayOfWeek.Monday
            },
            range: {type: RecurrenceRangeType.NoEnd},
            timezoneOffset: 8 * 60 * 60 * 1000
        };
        expect(matchRecurrence(new Date("2023-09-04T00:00:00+08:00"), spec11)).to.be.false;
        expect(matchRecurrence(new Date("2023-09-18T00:00:00+08:00"), spec11)).to.be.false;
        const spec12 = {
            startTime: new Date("2023-09-03T00:00:00+08:00"),
            duration: 1000,
            pattern: {
                type: RecurrencePatternType.Weekly,
                interval: 2,
                daysOfWeek: [DayOfWeek.Sunday, DayOfWeek.Monday],
                firstDayOfWeek: DayOfWeek.Sunday
            },
            range: {type: RecurrenceRangeType.NoEnd},
            timezoneOffset: 8 * 60 * 60 * 1000
        };
        expect(matchRecurrence(new Date("2023-09-04T00:00:00+08:00"), spec12)).to.be.true;
        expect(matchRecurrence(new Date("2023-09-18T00:00:00+08:00"), spec12)).to.be.true;
        const spec13 = {
            startTime: new Date("2023-09-03T00:00:00+08:00"),
            duration: 1000,
            pattern: {
                type: RecurrencePatternType.Weekly,
                interval: 2,
                daysOfWeek: [DayOfWeek.Sunday, DayOfWeek.Monday],
                firstDayOfWeek: DayOfWeek.Monday
            },
            range: {type: RecurrenceRangeType.Numbered, numberOfOccurrences: 3},
            timezoneOffset: 8 * 60 * 60 * 1000
        };
        expect(matchRecurrence(new Date("2023-09-17T00:00:00+08:00"), spec13)).to.be.true;
        const spec14 = {
            startTime: new Date("2024-02-02T12:00:00+08:00"),
            duration: 24 * 60 * 60 * 1000 + 1000,
            pattern: {
                type: RecurrencePatternType.Weekly,
                interval: 2,
                daysOfWeek: [DayOfWeek.Friday, DayOfWeek.Monday],
                firstDayOfWeek: DayOfWeek.Sunday
            },
            range: {type: RecurrenceRangeType.NoEnd},
            timezoneOffset: 8 * 60 * 60 * 1000
        };
        expect(matchRecurrence(new Date("2024-02-12T08:00:00+08:00"), spec14)).to.be.false;
        const spec15 = {
            startTime: new Date("2023-09-03T00:00:00+08:00"),
            duration: 4 * 24 * 60 * 60 * 1000,
            pattern: {
                type: RecurrencePatternType.Weekly,
                interval: 2,
                daysOfWeek: [DayOfWeek.Sunday, DayOfWeek.Monday],
                firstDayOfWeek: DayOfWeek.Monday
            },
            range: {type: RecurrenceRangeType.NoEnd},
            timezoneOffset: 8 * 60 * 60 * 1000
        };
        expect(matchRecurrence(new Date("2023-09-13T00:00:00+08:00"), spec15)).to.be.true;
        const spec16 = {
            startTime: new Date("2023-09-03T00:00:00+08:00"),
            duration: 4 * 24 * 60 * 60 * 1000,
            pattern: {
                type: RecurrencePatternType.Weekly,
                interval: 2,
                daysOfWeek: [DayOfWeek.Sunday, DayOfWeek.Monday],
                firstDayOfWeek: DayOfWeek.Monday
            },
            range: {type: RecurrenceRangeType.Numbered, numberOfOccurrences: 3},
            timezoneOffset: 8 * 60 * 60 * 1000
        };
        expect(matchRecurrence(new Date("2023-09-19T00:00:00+08:00"), spec16)).to.be.true;
        const spec17 = {
            startTime: new Date("2023-09-03T00:00:00+08:00"),
            duration: 4 * 24 * 60 * 60 * 1000,
            pattern: {
                type: RecurrencePatternType.Weekly,
                interval: 2,
                daysOfWeek: [DayOfWeek.Sunday, DayOfWeek.Monday],
                firstDayOfWeek: DayOfWeek.Monday
            },
            range: {type: RecurrenceRangeType.Numbered, numberOfOccurrences: 2},
            timezoneOffset: 8 * 60 * 60 * 1000
        };
        expect(matchRecurrence(new Date("2023-09-19T00:00:00+08:00"), spec17)).to.be.false;
        const spec18 = {
            startTime: new Date("2023-09-01T00:00:00+08:00"),
            duration: 1000,
            pattern: {
                type: RecurrencePatternType.Weekly,
                interval: 1,
                daysOfWeek: [DayOfWeek.Friday, DayOfWeek.Monday],
                firstDayOfWeek: DayOfWeek.Sunday
            },
            range: {type: RecurrenceRangeType.NoEnd},
            timezoneOffset: 8 * 60 * 60 * 1000
        };
        expect(matchRecurrence(new Date("2023-09-03T16:00:00+00:00"), spec18)).to.be.true;
        expect(matchRecurrence(new Date("2023-09-07T16:00:00+00:00"), spec18)).to.be.true;
        expect(matchRecurrence(new Date("2023-09-03T15:59:59+00:00"), spec18)).to.be.false;
        expect(matchRecurrence(new Date("2023-09-07T15:59:59+00:00"), spec18)).to.be.false;
        const spec19 = {
            startTime: new Date("2023-09-03T00:00:00+08:00"),
            duration: 4 * 24 * 60 * 60 * 1000,
            pattern: {
                type: RecurrencePatternType.Weekly,
                interval: 2,
                daysOfWeek: [DayOfWeek.Sunday, DayOfWeek.Monday],
                firstDayOfWeek: DayOfWeek.Monday
            },
            range: {type: RecurrenceRangeType.NoEnd},
            timezoneOffset: 8 * 60 * 60 * 1000
        };
        expect(matchRecurrence(new Date("2023-09-10T16:00:00+00:00"), spec19)).to.be.true;
        expect(matchRecurrence(new Date("2023-09-10T15:59:59+00:00"), spec19)).to.be.false;
    });
});
