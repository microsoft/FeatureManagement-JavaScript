# Microsoft Feature Management for JavaScript

[![feature-management](https://img.shields.io/npm/v/@microsoft/feature-management?label=@microsoft/feature-management)](https://www.npmjs.com/package/@microsoft/feature-management)

Feature management provides a way to develop and expose application functionality based on features. Many applications have special requirements when a new feature is developed such as when the feature should be enabled and under what conditions. This library provides a way to define these relationships, and also integrates into common .NET code patterns to make exposing these features possible.

## Getting Started

[Azure App Configuration Quickstart](https://learn.microsoft.com/azure/azure-app-configuration/quickstart-feature-flag-javascript): A quickstart guide about how to integrate feature flags from Azure App Configuration into your JavaScript applications.

[Feature Overview](https://learn.microsoft.com/azure/azure-app-configuration/feature-management-overview#feature-development-status): This document provides a feature status overview.

[Feature Reference](https://learn.microsoft.com/azure/azure-app-configuration/feature-management-javascript-reference): This document provides a full feature rundown.

### Usage

You can use feature flags from the Azure App Configuration service, local files or any other sources. For more information, please go to [Feature flag configuration](https://learn.microsoft.com/azure/azure-app-configuration/feature-management-javascript-reference#feature-flag-configuration).

#### Use feature flags from Azure App Configuration

The App Configuration JavaScript provider provides feature flags in as a `Map` object.
A builtin `ConfigurationMapFeatureFlagProvider` helps to load feature flags in this case.

```js
import { load } from "@azure/app-configuration-provider";
import { FeatureManager, ConfigurationMapFeatureFlagProvider } from "@microsoft/feature-management";
const appConfig = await load("<CONNECTION-STRING>", {featureFlagOptions}); // load feature flags from Azure App Configuration service
const featureProvider = new ConfigurationMapFeatureFlagProvider(appConfig);
const featureManager = new FeatureManager(featureProvider);
const isAlphaEnabled = await featureManager.isEnabled("Alpha");
console.log("Feature Alpha is:", isAlphaEnabled);
```

#### Use feature flags from a json file

A sample JSON file with the following format can be used to load feature flags.
The JSON file can be read and parsed as an object as a whole.
A builtin `ConfigurationObjectFeatureFlagProvider` helps to load feature flags in this case.

Content of `sample.json`:
```json
{
    "feature_management": {
        "feature_flags": [
            {
                "id": "Alpha",
                "description": "",
                "enabled": true,
                "conditions": {
                    "client_filters": []
                }
            }
        ]
    }
}
```

Load feature flags from `sample.json` file.
```js
import { FeatureManager, ConfigurationObjectFeatureFlagProvider } from "@microsoft/feature-management";
const config = JSON.parse(await fs.readFile("path/to/sample.json"));
const featureProvider = new ConfigurationObjectFeatureFlagProvider(config);
const featureManager = new FeatureManager(featureProvider);
const isAlphaEnabled = await featureManager.isEnabled("Alpha");
console.log("Feature Alpha is:", isAlphaEnabled);
```

## Examples

See code snippets under [examples/](./examples/) folder.

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
