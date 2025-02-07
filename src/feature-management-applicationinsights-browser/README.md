# Microsoft Feature Management Application Insights Plugin for Browser

Feature Management Application Insights Plugin for Browser provides a solution for sending feature flag evaluation events produced by the Feature Management library.

## Getting Started

### Usage

``` javascript
import { ApplicationInsights } from "@microsoft/applicationinsights-web"
import { FeatureManager, ConfigurationObjectFeatureFlagProvider } from "@microsoft/feature-management";
import { createTelemetryPublisher, trackEvent } from "@microsoft/feature-management-applicationinsights-browser";

const appInsights = new ApplicationInsights({ config: {
    connectionString: "<APPINSIGHTS_CONNECTION_STRING>"
}});
appInsights.loadAppInsights();

const publishTelemetry = createTelemetryPublisher(appInsights);
const provider = new ConfigurationObjectFeatureFlagProvider(jsonObject);
const featureManager = new FeatureManager(provider, {onFeatureEvaluated: publishTelemetry});

// FeatureEvaluation event will be emitted when a feature flag is evaluated
featureManager.getVariant("TestFeature", {userId : TARGETING_ID}).then((variant) => { /* do something*/ });

// Emit a custom event with targeting id attached.
trackEvent(appInsights, TARGETING_ID, {name: "TestEvent"}, {"Tag": "Some Value"});
```

## Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft 
trademarks or logos is subject to and must follow 
[Microsoft's Trademark & Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general).
Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship.
Any use of third-party trademarks or logos are subject to those third-party's policies.
