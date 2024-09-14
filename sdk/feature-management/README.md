# Microsoft Feature Management for JavaScript

[![feature-management](https://img.shields.io/npm/v/@microsoft/feature-management?label=@microsoft/feature-management)](https://www.npmjs.com/package/@microsoft/feature-management)

Feature Management is a library for enabling/disabling features at runtime.
Developers can use feature flags in simple use cases like conditional statement to more advanced scenarios like conditionally adding routes.

## Getting Started

### Prerequisites

- Node.js LTS version

### Usage

You can use feature flags from the Azure App Configuration service, local files or any other sources.

#### Use feature flags from Azure App Configuration

The App Configuration JavaScript provider provides feature flags in as a `Map` object.
A builtin `ConfigurationMapFeatureFlagProvider` helps to load feature flags in this case.

```js
const appConfig = load(connectionString, {featureFlagOptions}); // load feature flags from Azure App Configuration service
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
                "enabled": "true",
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
const config = JSON.parse(await fs.readFile("path/to/sample.json"));
const featureProvider = new ConfigurationObjectFeatureFlagProvider(config);
const featureManager = new FeatureManager(featureProvider);
const isAlphaEnabled = await featureManager.isEnabled("Alpha");
console.log("Feature Alpha is:", isAlphaEnabled);
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
