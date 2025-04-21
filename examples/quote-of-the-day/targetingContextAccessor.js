// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

const { AsyncLocalStorage } = require("async_hooks");

// Create AsyncLocalStorage for request access across async operations
const requestAccessor = new AsyncLocalStorage();

// Create targeting context accessor to get user information for feature targeting
const targetingContextAccessor = {
    getTargetingContext: () => {
        const req = requestAccessor.getStore();
        if (req === undefined) {
            return undefined;
        }
        // read user and groups from request
        const userId = req.query.userId ?? req.body.userId;
        const groups = req.query.groups ?? req.body.groups;
        // return an ITargetingContext with the appropriate user info
        return { userId: userId, groups: groups ? groups.split(",") : [] };
    }
};

// Create middleware to store request in AsyncLocalStorage
const requestStorageMiddleware = (req, res, next) => {
    requestAccessor.run(req, next);
};

module.exports = {
    targetingContextAccessor,
    requestStorageMiddleware
};