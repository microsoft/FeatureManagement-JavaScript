import { FeatureFilter } from "./FeatureFilter";

// [Start, End)
type TimeWindowParameters = {
    Start?: string;
    End?: string;
}

export class TimewindowFilter implements FeatureFilter {
    name: string = "Microsoft.TimeWindow";

    evaluate(parameters: TimeWindowParameters): boolean {
        const startTime = parameters.Start !== undefined ? new Date(parameters.Start) : undefined;
        const endTime = parameters.End !== undefined ? new Date(parameters.End) : undefined;

        if (startTime === undefined && endTime === undefined) {
            // If neither start nor end time is specified, then the filter is not applicable.
            return false;
        }
        const now = new Date();
        return (startTime === undefined || startTime <= now) && (endTime === undefined || now < endTime);
    }
}