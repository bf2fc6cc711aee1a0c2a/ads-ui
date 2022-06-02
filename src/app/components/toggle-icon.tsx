import React, {FunctionComponent} from "react";
import {ChevronRightIcon, ChevronDownIcon} from "@patternfly/react-icons";

/**
 * Properties
 */
export type ToggleIconProps = {
    expanded: boolean;
    onClick: () => void;
};

export const ToggleIcon: FunctionComponent<ToggleIconProps> = ({expanded, onClick}: ToggleIconProps) => {
    return expanded ? (
        <ChevronDownIcon />
    ) : (
        <ChevronRightIcon />
    );
};
