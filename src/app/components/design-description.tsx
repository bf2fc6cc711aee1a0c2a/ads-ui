import React, {FunctionComponent} from "react";
import "./design-description.css";
import {Truncate} from "@patternfly/react-core";

/**
 * Properties
 */
export type DesignDescriptionProps = {
    description: string | undefined;
    truncate?: boolean;
    className?: string;
}


export const DesignDescription: FunctionComponent<DesignDescriptionProps> = ({description, truncate, className}: DesignDescriptionProps) => {
    let classes: string = "";
    if (className) {
        classes = className;
    }
    if (!description) {
        classes = classes + " no-description";
    }
    return truncate ? (
        <div>
            <Truncate className={classes} content={description || "No description."} tooltipPosition="auto" />
        </div>
    ) : (
        <div className={classes}>{description || "No description."}</div>
    );
}
