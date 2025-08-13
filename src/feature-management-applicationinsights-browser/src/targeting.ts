// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { getDocument } from "@nevware21/ts-utils";
import { ITargetingContext, ITargetingContextAccessor } from "@microsoft/feature-management";

const APPLICATION_INSIGHTS_USER_COOKIE = "ai_user";

/**
 * A default implementation of ITargetingContextAccessor that retrieves targeting context from the document's cookie.
 */
export class DefaultHttpTargetingContextAccessor implements ITargetingContextAccessor {
    #document: Document;
    #cookieValue: string;
    #cookieCache: { [key: string]: string } = {};

    constructor() {
        this.#document = getDocument();
        this.#cookieValue = this.#document.cookie || "";
    }

    getTargetingContext(): ITargetingContext {
        return {
            userId: this.#getCookieValue(APPLICATION_INSIGHTS_USER_COOKIE)
        };
    }

    #getCookieValue(name: string): string {
        const cookie = this.#document.cookie || "";
        if (this.#cookieValue !== cookie) {
            this.#parseCookie(cookie);
            this.#cookieValue = cookie;
        }
        return this.#cookieCache[name] || "";
    }

    #parseCookie(cookie: string): void {
        this.#cookieCache = {};
        const cookies = cookie.split(";").map(c => c.trim());
        for (const c of cookies) {
            if (!c) {
                continue;
            }
            const eqIdx = c.indexOf("=");
            if (eqIdx > -1) {
                const name = c.substring(0, eqIdx).trim();
                const value = c.substring(eqIdx + 1).trim();
                this.#cookieCache[name] = value;
            }
        }
    }
}
