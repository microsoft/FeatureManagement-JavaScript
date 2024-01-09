import { TimewindowFilter } from "./filter/TimeWindowFilter";
import { FeatureFilter } from "./filter/FeatureFilter";
import { FEATURE_FLAGS_KEY, FEATURE_MANAGEMENT_KEY, FeatureDeclaration, FeatureManagement, RequirementType } from "./model";

export class FeatureManager {
    #dataSource: IFeatureManagerDataSource;
    #featureFilters: Map<string, FeatureFilter> = new Map();

    constructor(inputData: unknown, featureFilters?: FeatureFilter[]) {
        if (typeof inputData === "object" && inputData instanceof Map) {
            this.#dataSource = new MapBasedDataSource(inputData);
        } else if (typeof inputData === "string") {
            this.#dataSource = new JsonBasedDataSource(inputData);
        } else {
            throw new Error("Invalid input data");
        }

        const defaultFilters = [new TimewindowFilter()];
        for (const filter of [...defaultFilters, ...(featureFilters ?? [])]) {
            this.#featureFilters.set(filter.name, filter);
        }
    }

    listFeatureNames(): string[] {
        // TODO: whether to deduplicate the feature names?
        return this.#featureFlags.map((flag) => flag.id);
    }

    isEnabled(featureId: string): boolean {
        const featureFlag = this.#featureFlags.find((flag) => flag.id === featureId);
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
                    if (requirementType === RequirementType.Any && matchedFeatureFilter.evaluate(clientFilter.parameters)) {
                        return true;
                    } else if (requirementType === RequirementType.All && !matchedFeatureFilter.evaluate(clientFilter.parameters)) {
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

    get #featureFlags(): FeatureDeclaration[] {
        return this.#dataSource.featureFlags;
    }

}

interface IFeatureManagerDataSource {
    get featureFlags(): FeatureDeclaration[];
}

class MapBasedDataSource implements IFeatureManagerDataSource {
    #map: Map<string, FeatureManagement>;

    constructor(map: Map<string, FeatureManagement>) {
        this.#map = map;
    }

    get featureFlags(): FeatureDeclaration[] {
        return this.#map.get(FEATURE_MANAGEMENT_KEY)?.[FEATURE_FLAGS_KEY] ?? [];
    }
}

class JsonBasedDataSource implements IFeatureManagerDataSource {
    #featureFlags: FeatureDeclaration[];

    constructor(private json: string) {
        const featureManagement = JSON.parse(this.json) as FeatureManagement;

        if (featureManagement?.[FEATURE_MANAGEMENT_KEY]?.[FEATURE_FLAGS_KEY] === undefined) {
            throw new Error("Invalid input data");
        }

        this.#featureFlags = featureManagement[FEATURE_MANAGEMENT_KEY][FEATURE_FLAGS_KEY];
    }

    get featureFlags(): FeatureDeclaration[] {
        return this.#featureFlags;
    }
}