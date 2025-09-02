// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as chai from "chai";
import * as sinon from "sinon";
const expect = chai.expect;

import { FeatureManager, ConfigurationMapFeatureFlagProvider } from "../src/index.js";

const createTimeWindowFeature = (name: string, description: string, parameters: any) => {
    const featureFlag = {
        "id": name,
        "description": description,
        "enabled": true,
        "conditions": {
            "client_filters": [
                {
                    "name": "Microsoft.TimeWindow",
                    "parameters": parameters
                }
            ]
        }
    };

    return featureFlag;
};

describe("time window filter", () => {
    it("should evaluate basic time window", async () => {
        const dataSource = new Map();
        dataSource.set("feature_management", {
            feature_flags: [
                createTimeWindowFeature("PastTimeWindow",
                    "A feature flag using a time window filter, that is active from 2023-06-29 07:00:00 to 2023-08-30 07:00:00. Will always return false as the current time is outside the time window.",
                    {
                        "Start": "Thu, 29 Jun 2023 07:00:00 GMT",
                        "End": "Wed, 30 Aug 2023 07:00:00 GMT"
                    }
                ),
                createTimeWindowFeature("FutureTimeWindow",
                    "A feature flag using a time window filter, that is active from 3023-06-27 06:00:00 to 3023-06-28 06:05:00. Will always return false as the time window has yet been reached.",
                    {
                        "Start": "Fri, 27 Jun 3023 06:00:00 GMT",
                        "End": "Sat, 28 Jun 3023 06:05:00 GMT"
                    }
                ),
                createTimeWindowFeature("PresentTimeWindow",
                    "A feature flag using a time window filter, that is active from 2023-06-27 06:00:00 to 3023-06-28 06:05:00. Will always return true as we are in the time window.",
                    {
                        "Start": "Thu, 29 Jun 2023 07:00:00 GMT",
                        "End": "Sat, 28 Jun 3023 06:05:00 GMT"
                    }
                ),
                createTimeWindowFeature("StartedTimeWindow",
                    "A feature flag using a time window filter, that will always return true as the current time is within the time window.",
                    {
                        "Start": "Tue, 27 Jun 2023 06:00:00 GMT"
                    }
                ),
                createTimeWindowFeature("WillEndTimeWindow",
                    "A feature flag using a time window filter, that will always return true as the current time is within the time window.",
                    {
                        "End": "Sat, 28 Jun 3023 06:05:00 GMT"
                    }
                )
            ]
        });
        const provider = new ConfigurationMapFeatureFlagProvider(dataSource);
        const featureManager = new FeatureManager(provider);

        // specify the date you want to mock
        const fakeDate = new Date(2024, 12, 10); // Dec 10, 2024
        const clock = sinon.useFakeTimers(fakeDate.getTime());
        expect(await featureManager.isEnabled("PastTimeWindow")).eq(false);
        expect(await featureManager.isEnabled("PresentTimeWindow")).eq(true);
        expect(await featureManager.isEnabled("FutureTimeWindow")).eq(false);
        expect(await featureManager.isEnabled("StartedTimeWindow")).eq(true);
        expect(await featureManager.isEnabled("WillEndTimeWindow")).eq(true);
        clock.restore();
    });

    it("should evaluate recurring time window", async () => {
        const dataSource = new Map();
        dataSource.set("feature_management", {
            feature_flags: [
                createTimeWindowFeature("DailyTimeWindow",
                    "A feature flag using a recurring time window filter, that is active from 18:00:00 to 20:00:00 every other day since 2024-12-10, until 2025-1-1.",
                    {
                        "Start": "Tue, 10 Dec 2024 18:00:00 GMT",
                        "End": "Tue, 10 Dec 2024 20:00:00 GMT",
                        "Recurrence": {
                            "Pattern": {
                                "Type": "Daily",
                                "Interval": 2
                            },
                            "Range": {
                                "Type": "EndDate",
                                "EndDate": "Wed, 1 Jan 2025 20:00:00 GMT"
                            }
                        }
                    }
                )
            ]
        });
        const provider = new ConfigurationMapFeatureFlagProvider(dataSource);
        const featureManager = new FeatureManager(provider);

        // daily recurring time window
        let fakeDate = new Date("2024-12-10T17:59:59+0000");
        let clock = sinon.useFakeTimers(fakeDate.getTime());
        expect(await featureManager.isEnabled("DailyTimeWindow")).eq(false);
        clock.restore();

        fakeDate = new Date("2024-12-10T18:00:00+0000");
        clock = sinon.useFakeTimers(fakeDate.getTime());
        expect(await featureManager.isEnabled("DailyTimeWindow")).eq(true);
        clock.restore();

        fakeDate = new Date("2024-12-10T19:59:59+0000");
        clock = sinon.useFakeTimers(fakeDate.getTime());
        expect(await featureManager.isEnabled("DailyTimeWindow")).eq(true);
        clock.restore();

        fakeDate = new Date("2024-12-10T20:00:01+0000");
        clock = sinon.useFakeTimers(fakeDate.getTime());
        expect(await featureManager.isEnabled("DailyTimeWindow")).eq(false);
        clock.restore();

        fakeDate = new Date("2024-12-11T18:00:01+0000");
        clock = sinon.useFakeTimers(fakeDate.getTime());
        expect(await featureManager.isEnabled("DailyTimeWindow")).eq(false);
        clock.restore();

        fakeDate = new Date("2024-12-12T18:00:01+0000");
        clock = sinon.useFakeTimers(fakeDate.getTime());
        expect(await featureManager.isEnabled("DailyTimeWindow")).eq(true);
        clock.restore();

        fakeDate = new Date("2024-12-12T18:00:01+0000");
        clock = sinon.useFakeTimers(fakeDate.getTime());
        expect(await featureManager.isEnabled("DailyTimeWindow")).eq(true);
        clock.restore();

        fakeDate = new Date("2024-12-12T18:00:01+0000");
        clock = sinon.useFakeTimers(fakeDate.getTime());
        expect(await featureManager.isEnabled("DailyTimeWindow")).eq(true);
        clock.restore();

        fakeDate = new Date("2024-12-24T18:00:01+0000");
        clock = sinon.useFakeTimers(fakeDate.getTime());
        expect(await featureManager.isEnabled("DailyTimeWindow")).eq(true);
        clock.restore();

        fakeDate = new Date("2024-12-25T18:00:01+0000");
        clock = sinon.useFakeTimers(fakeDate.getTime());
        expect(await featureManager.isEnabled("DailyTimeWindow")).eq(false);
        clock.restore();

        fakeDate = new Date("2025-01-01T18:00:01+0000");
        clock = sinon.useFakeTimers(fakeDate.getTime());
        expect(await featureManager.isEnabled("DailyTimeWindow")).eq(true);
        clock.restore();

        fakeDate = new Date("2025-01-01T20:00:01+0000");
        clock = sinon.useFakeTimers(fakeDate.getTime());
        expect(await featureManager.isEnabled("DailyTimeWindow")).eq(false);
        clock.restore();

        fakeDate = new Date("2025-01-03T18:00:01+0000");
        clock = sinon.useFakeTimers(fakeDate.getTime());
        expect(await featureManager.isEnabled("DailyTimeWindow")).eq(false);
        clock.restore();

        // weekly recurring time window
        dataSource.set("feature_management", {
            feature_flags: [
                createTimeWindowFeature("WeeklyTimeWindow",
                    "A feature flag using a recurring time window filter, that is active from 18:00:00 to 20:00:00 every weekday since 2024-12-10, until the time window recurs for 10 times.",
                    {
                        "Start": "Tue, 10 Dec 2024 18:00:00 GMT",
                        "End": "Tue, 10 Dec 2024 20:00:00 GMT",
                        "Recurrence": {
                            "Pattern": {
                                "Type": "Weekly",
                                "Interval": 1,
                                "DaysOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
                            },
                            "Range": {
                                "Type": "Numbered",
                                "NumberOfOccurrences": 10
                            }
                        }
                    }
                )
            ]
        });
        fakeDate = new Date("2024-12-10T17:59:59+0000");
        clock = sinon.useFakeTimers(fakeDate.getTime());
        expect(await featureManager.isEnabled("WeeklyTimeWindow")).eq(false);
        clock.restore();

        fakeDate = new Date("2024-12-10T18:00:01+0000");
        clock = sinon.useFakeTimers(fakeDate.getTime());
        expect(await featureManager.isEnabled("WeeklyTimeWindow")).eq(true);
        clock.restore();

        fakeDate = new Date("2024-12-11T18:00:01+0000");
        clock = sinon.useFakeTimers(fakeDate.getTime());
        expect(await featureManager.isEnabled("WeeklyTimeWindow")).eq(true);
        clock.restore();

        fakeDate = new Date("2024-12-12T18:00:01+0000");
        clock = sinon.useFakeTimers(fakeDate.getTime());
        expect(await featureManager.isEnabled("WeeklyTimeWindow")).eq(true);
        clock.restore();

        fakeDate = new Date("2024-12-13T18:00:01+0000");
        clock = sinon.useFakeTimers(fakeDate.getTime());
        expect(await featureManager.isEnabled("WeeklyTimeWindow")).eq(true);
        clock.restore();

        fakeDate = new Date("2024-12-14T18:00:01+0000"); // Saturday
        clock = sinon.useFakeTimers(fakeDate.getTime());
        expect(await featureManager.isEnabled("WeeklyTimeWindow")).eq(false);
        clock.restore();

        fakeDate = new Date("2024-12-15T18:00:01+0000"); // Sunday
        clock = sinon.useFakeTimers(fakeDate.getTime());
        expect(await featureManager.isEnabled("WeeklyTimeWindow")).eq(false);
        clock.restore();

        fakeDate = new Date("2024-12-16T18:00:01+0000");
        clock = sinon.useFakeTimers(fakeDate.getTime());
        expect(await featureManager.isEnabled("WeeklyTimeWindow")).eq(true);
        clock.restore();

        fakeDate = new Date("2024-12-16T20:00:01+0000");
        clock = sinon.useFakeTimers(fakeDate.getTime());
        expect(await featureManager.isEnabled("WeeklyTimeWindow")).eq(false);
        clock.restore();

        fakeDate = new Date("2024-12-23T18:00:01+0000");
        clock = sinon.useFakeTimers(fakeDate.getTime());
        expect(await featureManager.isEnabled("WeeklyTimeWindow")).eq(true);
        clock.restore();

        fakeDate = new Date("2024-12-24T18:00:01+0000");
        clock = sinon.useFakeTimers(fakeDate.getTime());
        expect(await featureManager.isEnabled("WeeklyTimeWindow")).eq(false);
        clock.restore();
    });
});
