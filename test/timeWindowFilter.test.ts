// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as sinon from "sinon";
chai.use(chaiAsPromised);
const expect = chai.expect;

import { FeatureManager, ConfigurationMapFeatureFlagProvider } from "./exportedApi";

const createTimeWindowFeature = (name: string, description: string, parameters: { Start?: string, End?: string }) => {
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
}

describe("time window filter", () => {
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

    let clock;

    beforeEach(() => {
        // Specify the date you want to mock
        const fakeDate = new Date(2024, 5, 29); // May 29, 2024
        clock = sinon.useFakeTimers(fakeDate.getTime());
    });

    afterEach(() => {
        clock.restore();
    });

    it("evaluate basic time window", () => {

        const provider = new ConfigurationMapFeatureFlagProvider(dataSource);
        const featureManager = new FeatureManager(provider);

        return Promise.all([
            expect(featureManager.isEnabled("PastTimeWindow")).eventually.eq(false),
            expect(featureManager.isEnabled("PresentTimeWindow")).eventually.eq(true),
            expect(featureManager.isEnabled("FutureTimeWindow")).eventually.eq(false),
            expect(featureManager.isEnabled("StartedTimeWindow")).eventually.eq(true),
            expect(featureManager.isEnabled("WillEndTimeWindow")).eventually.eq(true),
        ]);
    });

});
