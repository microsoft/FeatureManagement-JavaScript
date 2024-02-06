import { TimewindowFilter } from "./filter/TimeWindowFilter";
import { IFeatureFilter } from "./filter/FeatureFilter";
import { FeatureDefinition, RequirementType } from "./model";
import { IFeatureProvider } from "./featureProvider";

export class FeatureManager {
    #provider: IFeatureProvider;
    #featureFilters: Map<string, IFeatureFilter> = new Map();

    constructor(provider: IFeatureProvider, options?: FeatureManagerOptions) {
        this.#provider = provider;

        const defaultFilters = [new TimewindowFilter()];
        for (const filter of [...defaultFilters, ...(options?.customFilters ?? [])]) {
            this.#featureFilters.set(filter.name, filter);
        }
    }

    async listFeatureNames(): Promise<string[]> {
        const features = await this.#features();
        const featureNameSet = new Set(features.map((feature) => feature.id));
        return Array.from(featureNameSet);
    }

    // If multiple feature flags are found, the first one takes precedence.
    async isEnabled(featureId: string, context?: unknown): Promise<boolean> {
        const features = await this.#features();
        const featureFlag = features.find((flag) => flag.id === featureId);
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

    async #features(): Promise<FeatureDefinition[]> {
        const features = await this.#provider.getFeatureFlags();
        return features;
    }

}

interface FeatureManagerOptions {
    customFilters?: IFeatureFilter[];
}