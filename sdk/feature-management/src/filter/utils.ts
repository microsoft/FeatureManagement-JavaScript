// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export const VALUE_OUT_OF_RANGE_ERROR_MESSAGE = "The value is out of the accepted range.";
export const UNRECOGNIZABLE_VALUE_ERROR_MESSAGE = "The value is unrecognizable.";
export const REQUIRED_PARAMETER_MISSING_ERROR_MESSAGE = "Value cannot be undefined or empty.";

export function buildInvalidParameterErrorMessage(parameterName: string, additionalInfo?: string): string {
    return `The ${parameterName} parameter is not valid. ` + (additionalInfo ?? "");
}
