# Examples for Microsoft Feature Management for JavaScript

These examples show how to use the Microsoft Feature Management in some common scenarios.

## Prerequisites

The examples are compatible with [LTS versions of Node.js](https://github.com/nodejs/release#release-schedule).

Some examples use `@azure/app-configuration-provider` to load feature flags from the [Azure App Configuration](https://learn.microsoft.com/azure/azure-app-configuration/overview). Azure App Configuration provides a service to centrally manage application settings and feature flags. The examples retrieve credentials to access your App Configuration store from environment variables. Edit the file `.env.template`, adding the access keys to your App Configuration store. and rename the file from `.env.template` to just `.env`. The examples will read this file automatically.

## Setup & Run

1. Build the feature management package in the root folder.

    ``` bash
    npm install
    npm run build
    ```

The examples reference the local `@microsoft/feature-management` package implemented in the `src` folder. Before running the example programs, make sure that you have built it. 

1. Go to the `examples` folder. Install the dependencies using `npm`:

    ``` bash
    npm install
    ```
    
1. Run the examples:

    ``` bash
    node featureFlagSample.mjs
    ```
