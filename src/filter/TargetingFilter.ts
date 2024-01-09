import { ClientFilterParameters } from "../model";

interface TargetingParameters extends ClientFilterParameters {
    // TODO: add targeting parameters.
}

export class TargetingFilter {
    name = "Microsoft.Targeting";

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    evaluate(_parameters: TargetingParameters): boolean {
        throw new Error("Not implemented");
    }
}