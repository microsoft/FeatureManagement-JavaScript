// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Recurrence } from "./model.js";

export function matchRecurrence(time: Date, recurrence: Recurrence): boolean {
    if (time < recurrence.StartTime) {
        return false;
    }
    return false;
}
