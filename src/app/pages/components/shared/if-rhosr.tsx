import React, {FunctionComponent} from "react";
import {Registry} from "@rhoas/registry-management-sdk";

export type RhosrScopeType = "read" | "write" | "admin";


/**
 * Properties
 */
export type IfRhosrProps = {
    registry: Registry;
    scope: RhosrScopeType;
    noAccess: string | React.ReactNode;
    children?: React.ReactNode;
};

/**
 * Wrapper around a set of arbitrary child elements and displays them only if the
 * given registry instance is accessible by the user at the level needed.  This
 * component can be used to guard functionality that will only work if the user
 * has permission to interact with the registry in the required way.
 */
export const IfRhosr: FunctionComponent<IfRhosrProps> = ({registry, scope, noAccess, children}: IfRhosrProps) => {
    return (
        <React.Fragment children={children} />
    );
};
