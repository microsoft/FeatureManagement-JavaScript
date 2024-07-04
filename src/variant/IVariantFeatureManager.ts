import { ITargetingContext } from "../common/ITargetingContext";
import { Variant } from "./Variant";

export interface IVariantFeatureManager {
    getVariant(featureName: string, context: ITargetingContext): Promise<Variant | undefined>;
}
