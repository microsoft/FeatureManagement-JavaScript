
export interface IFeatureFilter {
    name: string; //e.g. Microsoft.TimeWindow
    evaluate(parameters?: unknown, appContext?: unknown): Promise<boolean> | boolean;
}

