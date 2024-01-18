import { ClientFilterParameters } from "../model";

export interface IFeatureFilter {
    name: string; //e.g. Microsoft.TimeWindow
    evaluate(parameters?: ClientFilterParameters, appContext?: unknown): Promise<boolean> | boolean;
}

