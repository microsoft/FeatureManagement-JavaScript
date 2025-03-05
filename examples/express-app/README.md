# Examples for Microsoft Feature Management for JavaScript

These examples show how to use the Microsoft Feature Management in an express application.

## Prerequisites

The examples are compatible with [LTS versions of Node.js](https://github.com/nodejs/release#release-schedule).

## Setup & Run

1. Install the dependencies using `npm`:

    ```bash
    npm install
    ```
    
1. Run the examples:

    ```bash
    node server.mjs
    ```

1. Visit `http://localhost:3000/Beta` and use `userId` and `groups` query to specify the targeting context (e.g. /Beta?userId=Jeff or /Beta?groups=Admin). 

    - If you are not targeted, you will get the message "Page not found".

    - If you are targeted, you will get the message "Welcome to the Beta page!".

## Targeting

The targeting mechanism uses the `exampleTargetingContextAccessor` to extract the targeting context from the request. This function retrieves the userId and groups from the query parameters of the request.

```javascript
const exampleTargetingContextAccessor = () => {
    const req = requestAccessor.getStore();
    const { userId, groups } = req.query;
    return { userId: userId, groups: groups ? groups.split(",") : [] };
};
```

The `FeatureManager` is configured with this targeting context accessor:

```javascript
const featureManager = new FeatureManager(
    featureProvider, 
    { 
        targetingContextAccessor: exampleTargetingContextAccessor 
    }
);
```

This allows you to get ambient targeting context while doing feature flag evaluation.

### Request Accessor

The `requestAccessor` is an instance of `AsyncLocalStorage` from the `async_hooks` module. It is used to store the request object in asynchronous local storage, allowing it to be accessed throughout the lifetime of the request. This is particularly useful for accessing request-specific data in asynchronous operations. For more information, please go to https://nodejs.org/api/async_context.html

```javascript
import { AsyncLocalStorage } from "async_hooks";
const requestAccessor = new AsyncLocalStorage();
```

Middleware is used to store the request object in the AsyncLocalStorage:

```javascript
server.use((req, res, next) => {
    requestAccessor.run(req, next);
});
```