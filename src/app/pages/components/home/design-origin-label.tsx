import React, {FunctionComponent} from "react";
import {Design} from "@app/models";
import {Label} from "@patternfly/react-core";
import {hasOrigin} from "@app/utils";


export type DesignOriginLabelProps = {
    design: Design|undefined;
};


export const DesignOriginLabel: FunctionComponent<DesignOriginLabelProps> = ({design}: DesignOriginLabelProps) => {

    const label = (): string => {
        if (design) {
            if (hasOrigin(design, "file")) {
                return "Local file";
            } else if (hasOrigin(design, "rhosr")) {
                return "Service registry";
            } else if (hasOrigin(design, "url")) {
                return "URL";
            } else if (hasOrigin(design, "create")) {
                return "New design";
            }
        }
        return "n/a";
    };

    return (
        <Label color="blue">{label()}</Label>
    );
};
