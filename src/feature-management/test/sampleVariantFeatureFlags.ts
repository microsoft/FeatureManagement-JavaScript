export enum Features {
    VariantFeatureDefaultDisabled = "VariantFeatureDefaultDisabled",
    VariantFeatureDefaultEnabled = "VariantFeatureDefaultEnabled",
    VariantFeaturePercentileOn = "VariantFeaturePercentileOn",
    VariantFeaturePercentileOff = "VariantFeaturePercentileOff",
    VariantFeatureUser = "VariantFeatureUser",
    VariantFeatureGroup = "VariantFeatureGroup",
    VariantFeatureNoVariants = "VariantFeatureNoVariants",
    VariantFeatureNoAllocation = "VariantFeatureNoAllocation",
    VariantFeatureInvalidStatusOverride = "VariantFeatureInvalidStatusOverride",
    VariantFeatureInvalidFromTo = "VariantFeatureInvalidFromTo",
}

export const featureFlagsConfigurationObject = {
    "feature_management": {
        "feature_flags": [
            {
                "id": "VariantFeaturePercentileOn",
                "enabled": true,
                "variants": [
                    {
                        "name": "Big",
                        "status_override": "Disabled"
                    }
                ],
                "allocation": {
                    "percentile": [
                        {
                            "variant": "Big",
                            "from": 0,
                            "to": 50
                        }
                    ],
                    "seed": "1234"
                },
                "telemetry": {
                    "enabled": true
                }
            },
            {
                "id": "VariantFeaturePercentileOff",
                "enabled": true,
                "variants": [
                    {
                        "name": "Big"
                    }
                ],
                "allocation": {
                    "percentile": [
                        {
                            "variant": "Big",
                            "from": 0,
                            "to": 50
                        }
                    ],
                    "seed": "12345"
                },
                "telemetry": {
                    "enabled": true
                }
            },
            {
                "id": "VariantFeatureDefaultDisabled",
                "enabled": false,
                "variants": [
                    {
                        "name": "Small",
                        "configuration_value": "300px"
                    }
                ],
                "allocation": {
                    "default_when_disabled": "Small"
                },
                "telemetry": {
                    "enabled": true
                }
            },
            {
                "id": "VariantFeatureDefaultEnabled",
                "enabled": true,
                "variants": [
                    {
                        "name": "Medium",
                        "configuration_value": {
                            "Size": "450px",
                            "Color": "Purple"
                        }
                    },
                    {
                        "name": "Small",
                        "configuration_value": "300px"
                    }
                ],
                "allocation": {
                    "default_when_enabled": "Medium",
                    "user": [
                        {
                            "variant": "Small",
                            "users": [
                                "Jeff"
                            ]
                        }
                    ]
                },
                "telemetry": {
                    "enabled": true
                }
            },
            {
                "id": "VariantFeatureUser",
                "enabled": true,
                "variants": [
                    {
                        "name": "Small",
                        "configuration_value": "300px"
                    }
                ],
                "allocation": {
                    "user": [
                        {
                            "variant": "Small",
                            "users": [
                                "Marsha"
                            ]
                        }
                    ]
                },
                "telemetry": {
                    "enabled": true
                }
            },
            {
                "id": "VariantFeatureGroup",
                "enabled": true,
                "variants": [
                    {
                        "name": "Small",
                        "configuration_value": "300px"
                    }
                ],
                "allocation": {
                    "group": [
                        {
                            "variant": "Small",
                            "groups": [
                                "Group1"
                            ]
                        }
                    ]
                },
                "telemetry": {
                    "enabled": true
                }
            },
            {
                "id": "VariantFeatureNoVariants",
                "enabled": true,
                "variants": [],
                "allocation": {
                    "user": [
                        {
                            "variant": "Small",
                            "users": [
                                "Marsha"
                            ]
                        }
                    ]
                },
                "telemetry": {
                    "enabled": true
                }
            },
            {
                "id": "VariantFeatureNoAllocation",
                "enabled": true,
                "variants": [
                    {
                        "name": "Small",
                        "configuration_value": "300px"
                    }
                ],
                "telemetry": {
                    "enabled": true
                }
            },
            {
                "id": "VariantFeatureInvalidStatusOverride",
                "enabled": true,
                "variants": [
                    {
                        "name": "Small",
                        "configuration_value": "300px",
                        "status_override": "InvalidValue"
                    }
                ],
                "allocation": {
                    "default_when_enabled": "Small"
                }
            },
            {
                "id": "VariantFeatureInvalidFromTo",
                "enabled": true,
                "variants": [
                    {
                        "name": "Small",
                        "configuration_value": "300px"
                    }
                ],
                "allocation": {
                    "percentile": [
                        {
                            "variant": "Small",
                            "from": "Invalid",
                            "to": "Invalid"
                        }
                    ]
                }
            }
        ]
    }
};
