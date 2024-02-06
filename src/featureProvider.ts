import { IGettable, isGettable } from "./gettable";
import { FeatureDefinition, FeatureConfiguration, FEATURE_MANAGEMENT_KEY, FEATURE_FLAGS_KEY } from "./model";

export interface IFeatureProvider {
    getFeatureFlags(): Promise<FeatureDefinition[]>;
}

export class ConfigurationFeatureProvider implements IFeatureProvider {
    #configuration: IGettable | Record<string, unknown>;

    constructor(configuration: Record<string, unknown> | IGettable) {
        if (typeof configuration !== "object") {
            throw new Error("Configuration must be an object.");
        }
        this.#configuration = configuration;
    }

    async getFeatureFlags(): Promise<FeatureDefinition[]> {
        if (isGettable(this.#configuration)) {
            const featureConfig = this.#configuration.get<FeatureConfiguration>(FEATURE_MANAGEMENT_KEY);
            return featureConfig?.[FEATURE_FLAGS_KEY] ?? [];
        } else {
            return this.#configuration[FEATURE_MANAGEMENT_KEY]?.[FEATURE_FLAGS_KEY] ?? [];
        }
    }
}
