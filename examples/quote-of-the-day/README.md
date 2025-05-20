# Quote of the day - JavaScript

These examples show how to use the Microsoft Feature Management in an express application.

## Setup & Run

1. Build the project.

```cmd
npm run build
```

1. Start the application.

```cmd
npm run start
```

## Telemetry

The Quote of the Day example implements telemetry using Azure Application Insights to track feature flag evaluations. This helps monitor and analyze how feature flags are being used in your application.

### Application Insights Integration

The application uses the `@microsoft/feature-management-applicationinsights-node` package to integrate Feature Management with Application Insights:

```javascript
const { createTelemetryPublisher } = require("@microsoft/feature-management-applicationinsights-node");

// When initializing Feature Management
const publishTelemetry = createTelemetryPublisher(appInsightsClient);
featureManager = new FeatureManager(featureFlagProvider, {
    onFeatureEvaluated: publishTelemetry,
    targetingContextAccessor: targetingContextAccessor
});
```

The `onFeatureEvaluated` option registers a callback that automatically sends telemetry events to Application Insights whenever a feature flag is evaluated.

### Targeting Context in Telemetry

`createTargetingTelemetryProcessor` method creates a built-in Application Insights telemetry processor which gets targeting context from the targeting context accessor and attaches the targeting id to telemetry.

```javascript
// Initialize Application Insights with targeting context
applicationInsights.defaultClient.addTelemetryProcessor(
    createTargetingTelemetryProcessor(targetingContextAccessor)
);
```

This ensures that every telemetry sent to Application Insights includes the targeting id information, allowing you to correlate feature flag usage with specific users or groups in your analytics.

### Experimentation and A/B Testing

Telemetry is particularly valuable for running experiments like A/B tests. Here's how you can use telemetry to track whether different variants of a feature influence user behavior.

In this example, a variant feature flag is used to track the like button click rate of a web application:

```json
{
    "id": "Greeting",
    "enabled": true,
    "variants": [
        {
            "name": "Default"
        },
        {
            "name": "Simple",
            "configuration_value": "Hello!"
        },
        {
            "name": "Long",
            "configuration_value": "I hope this makes your day!"
        }
    ],
    "allocation": {
        "percentile": [
        {
            "variant": "Default",
            "from": 0,
            "to": 50
        },
        {
            "variant": "Simple",
            "from": 50,
            "to": 75
        },
        {
            "variant": "Long",
            "from": 75,
            "to": 100
        }
        ],
        "default_when_enabled": "Default",
        "default_when_disabled": "Default"
    },
    "telemetry": {
        "enabled": true
    }
}
```

## Targeting

The targeting mechanism uses the `exampleTargetingContextAccessor` to extract the targeting context from the request. This function retrieves the userId and groups from the query parameters of the request.

```javascript
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

This allows you to get ambient targeting context while doing feature flag evaluation and variant allocation.

### Request Accessor

The `requestAccessor` is an instance of `AsyncLocalStorage` from the `async_hooks` module. It is used to store the request object in asynchronous local storage, allowing it to be accessed throughout the lifetime of the request. This is particularly useful for accessing request-specific data in asynchronous operations. For more information, please go to https://nodejs.org/api/async_context.html

```javascript
import { AsyncLocalStorage } from "async_hooks";
const requestAccessor = new AsyncLocalStorage();
```

Middleware is used to store the request object in the AsyncLocalStorage:

```javascript
const requestStorageMiddleware = (req, res, next) => {
    requestAccessor.run(req, next);
};

...

server.use(requestStorageMiddleware);
```
