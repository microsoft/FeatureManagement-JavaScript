import { TimewindowFilter } from "./filter/TimeWindowFilter";
import { IFeatureFilter } from "./filter/FeatureFilter";
import { FEATURE_FLAGS_KEY, FEATURE_MANAGEMENT_KEY, FeatureDefinition, FeatureManagement, RequirementType } from "./model";

export class FeatureManager {
    #provider: IFeatureDefinitionProvider;
    #featureFilters: Map<string, IFeatureFilter> = new Map();

    constructor(provider: IFeatureDefinitionProvider, options?: FeatureManagerOptions) {
        this.#provider = provider;

        const defaultFilters = [new TimewindowFilter()];
        for (const filter of [...defaultFilters, ...(options?.customFilters ?? [])]) {
            this.#featureFilters.set(filter.name, filter);
        }
    }

    listFeatureNames(): string[] {
        const featureNameSet = new Set(this.#features.map((feature) => feature.id));
        return Array.from(featureNameSet);
    }

    // If multiple feature flags are found, the first one takes precedence.
    async isEnabled(featureId: string, context?: unknown): Promise<boolean> {
        const featureFlag = this.#features.find((flag) => flag.id === featureId);
        if (featureFlag === undefined) {
            // If the feature is not found, then it is disabled.
            return false;
        }

        if (featureFlag.enabled === false) {
            // If the feature is explicitly disabled, then it is disabled.
            return false;
        }

        const clientFilters = featureFlag.conditions?.client_filters;
        if (clientFilters === undefined) {
            // If there are no client filters, then the feature is enabled.
            return true;
        } else {
            const requirementType = featureFlag.conditions?.requirement_type ?? RequirementType.All; // default to all.
            for (const clientFilter of clientFilters) {
                const matchedFeatureFilter = this.#featureFilters.get(clientFilter.name);
                if (matchedFeatureFilter !== undefined) {
                    if (requirementType === RequirementType.Any && await matchedFeatureFilter.evaluate(clientFilter.parameters, context)) {
                        return true;
                    } else if (requirementType === RequirementType.All && !await matchedFeatureFilter.evaluate(clientFilter.parameters, context)) {
                        return false;
                    }
                } else {
                    // TODO: log warning that the client filter is not found.
                }
            }

            // If we get here, then we have not found a client filter that matches the requirement type.
            if (requirementType === RequirementType.Any) {
                return false;
            } else {
                return true;
            }
        }
    }

    get #features(): FeatureDefinition[] {
        return this.#provider.getFeatureDefinitions();
    }

}

export interface IFeatureDefinitionProvider {
    getFeatureDefinitions(): FeatureDefinition[];
}

export class MapBasedFeatureDefinitionProvider implements IFeatureDefinitionProvider {
    #map: Map<string, FeatureManagement>;

    constructor(map: Map<string, FeatureManagement>) {
        this.#map = map;
    }

    getFeatureDefinitions(): FeatureDefinition[] {
        return this.#map.get(FEATURE_MANAGEMENT_KEY)?.[FEATURE_FLAGS_KEY] ?? [];
    }
}

export class JsonBasedFeatureDefinitionProvider implements IFeatureDefinitionProvider {
    #featureFlags: FeatureDefinition[];

    constructor(private json: string) {
        const featureManagement = JSON.parse(this.json) as FeatureManagement;

        if (featureManagement?.[FEATURE_MANAGEMENT_KEY]?.[FEATURE_FLAGS_KEY] === undefined) {
            throw new Error("Invalid input data");
        }

        this.#featureFlags = featureManagement[FEATURE_MANAGEMENT_KEY][FEATURE_FLAGS_KEY];
    }

    getFeatureDefinitions(): FeatureDefinition[] {
        return this.#featureFlags;
    }
}

interface FeatureManagerOptions {
    customFilters?: IFeatureFilter[];
}