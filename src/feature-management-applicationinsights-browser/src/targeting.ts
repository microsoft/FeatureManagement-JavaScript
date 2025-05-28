// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { getDocument, strTrim } from "@nevware21/ts-utils";
import { ITargetingContext, ITargetingContextAccessor } from "@microsoft/feature-management";

const strCookie = "cookie";

export class DefaultHttpTargetingContextAccessor implements ITargetingContextAccessor {
    #cookieValue: string;
    #cookieCache: { [key: string]: string } | undefined;


    getTargetingContext(): ITargetingContext {
        return {};
    }

    #
}