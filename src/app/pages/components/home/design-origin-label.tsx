import React, { FunctionComponent } from "react";
import { Design } from "@app/models";
import { Label } from "@patternfly/react-core";
import { hasOrigin } from "@app/utils";


export type DesignOriginLabelProps = {
    design: Design|undefined;
};


export const DesignOriginLabel: FunctionComponent<DesignOriginLabelProps> = ({design}: DesignOriginLabelProps) => {

    const label = (): string => {
        if (design) {
            if (hasOrigin(design, "file")) {
                return "File";
            } else if (hasOrigin(design, "rhosr")) {
                return "Service Registry";
            } else if (hasOrigin(design, "url")) {
                return "URL";
            } else if (hasOrigin(design, "create")) {
                return "New design";
            }
        }
        return "n/a";
    };

    const color = (): "blue" | "cyan" | "green" | "orange" | "purple" | "red" | "grey" => {
        if (design) {
            if (hasOrigin(design, "file")) {
                return "purple";
            } else if (hasOrigin(design, "rhosr")) {
                return "blue";
            } else if (hasOrigin(design, "url")) {
                return "green";
            }
        }
        return "grey";
    };

    return (
        <Label color={color()}>{label()}</Label>
    );
};
