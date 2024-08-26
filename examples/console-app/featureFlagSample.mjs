// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import fs from 'node:fs/promises';
import { ConfigurationObjectFeatureFlagProvider, FeatureManager } from "@microsoft/feature-management";

const config = JSON.parse(await fs.readFile("config.json"));
const featureProvider = new ConfigurationObjectFeatureFlagProvider(config);
const featureManager = new FeatureManager(featureProvider);

console.log("FeatureX is:", await featureManager.isEnabled("FeatureX"));
console.log("FeatureY is:", await featureManager.isEnabled("FeatureY"));

// Is true between 2024-8-15 ~ 2024-8-19
console.log("Feature flag with Time WindoW Filter is:", await featureManager.isEnabled("FeatureFlagWithTimeWindowFilter"));

// Targeted by Users
console.log("Feature flag with Targeting Filter is:", await featureManager.isEnabled("FeatureFlagWithTargetingFilter", {userId: "Jeff"}))
// Excluded by Users
console.log("Feature flag with Targeting Filter is:", await featureManager.isEnabled("FeatureFlagWithTargetingFilter", {userId: "Anne"}))
// Targeted by Groups Admin
console.log("Feature flag with Targeting Filter is:", await featureManager.isEnabled("FeatureFlagWithTargetingFilter", {userId: "Admin1", groups: ["Admin"]}))
// Excluded by Groups Guest
console.log("Feature flag with Targeting Filter is:", await featureManager.isEnabled("FeatureFlagWithTargetingFilter", {userId: "Guest1", groups: ["Guest"]}))

// Targeted by default rollout percentage
console.log("Feature flag with Targeting Filter is:", await featureManager.isEnabled("FeatureFlagWithTargetingFilter", {userId: "Alicia"}))
console.log("Feature flag with Targeting Filter is:", await featureManager.isEnabled("FeatureFlagWithTargetingFilter", {userId: "Susan"}))
console.log("Feature flag with Targeting Filter is:", await featureManager.isEnabled("FeatureFlagWithTargetingFilter", {userId: "John"}))
