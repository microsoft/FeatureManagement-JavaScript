import { ClientFilterParameters } from "../model";

export interface FeatureFilter {
    evaluate(context?: ClientFilterParameters): boolean;
    name: string;
}
