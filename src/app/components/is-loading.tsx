import React, {FunctionComponent} from "react";
import {Spinner} from "@patternfly/react-core";

/**
 * Properties
 */
export type IsLoadingProps = {
    condition: boolean | (() => boolean);
    children?: React.ReactNode;
}

/**
 * Displays a Spinner control while the condition property is true.  When false, the provided children
 * are displayed.  Useful when displaying content from the results of an async operation such as a REST
 * call.
 */
export const IsLoading: FunctionComponent<IsLoadingProps> = ({condition, children}: IsLoadingProps) => {
    const accept = () => {
        if (typeof condition === "boolean") {
            return condition;
        } else {
            return condition();
        }
    }

    return (accept() ? <Spinner /> : <React.Fragment children={children} />);
};
