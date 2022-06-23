import React, {FunctionComponent} from "react";
import "./design-description.css";

/**
 * Properties
 */
export type DesignDescriptionProps = {
    description: string | undefined;
    className?: string;
}


export const DesignDescription: FunctionComponent<DesignDescriptionProps> = ({description, className}: DesignDescriptionProps) => {
    let classes: string = "";
    if (className) {
        classes = className;
    }
    if (!description) {
        classes = classes + " no-description";
    }
    return (
        <div className={classes}>{description || "No description."}</div>
    );
}
