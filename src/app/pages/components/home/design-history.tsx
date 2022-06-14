import React, {FunctionComponent} from "react";
import {Design} from "@app/models";

/**
 * Properties
 */
export type DesignHistoryProps = {
    design: Design;
};

export const DesignHistory: FunctionComponent<DesignHistoryProps> = ({design}: DesignHistoryProps) => {
    return (
        <div>HISTORY</div>
    );
};
