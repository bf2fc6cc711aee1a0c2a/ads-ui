import React, { FunctionComponent } from "react";

/**
 * Properties
 */
export type ArtifactGroupProps = {
    groupId: string|undefined;
}

/**
 * Displays a RHOSR artifact's group.
 */
export const ArtifactGroup: FunctionComponent<ArtifactGroupProps> = ({groupId}: ArtifactGroupProps) => {
    const style = (): string => {
        return !groupId ? "nogroup" : "group";
    };

    return (
        <span className={style()}>{groupId}</span>
    );
};
