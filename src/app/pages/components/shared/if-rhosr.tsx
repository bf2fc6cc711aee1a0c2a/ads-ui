import React, {FunctionComponent, useEffect, useState} from "react";
import {Registry} from "@rhoas/registry-management-sdk";
import {RhosrInstanceService, RhosrInstanceServiceFactory, useRhosrInstanceServiceFactory} from "@app/services";
import {UserInfo} from "@app/models";
import {Alert} from "@patternfly/react-core";
import {IsLoading} from "@app/components";

export type RhosrScopeType = "read" | "write" | "admin";


/**
 * Properties
 */
export type IfRhosrProps = {
    registry: Registry;
    scope: RhosrScopeType;
    onHasAccess?: (accessible: boolean) => void;
    children?: React.ReactNode;
};

/**
 * Wrapper around a set of arbitrary child elements and displays them only if the
 * given registry instance is accessible by the user at the level needed.  This
 * component can be used to guard functionality that will only work if the user
 * has permission to interact with the registry in the required way.
 */
export const IfRhosr: FunctionComponent<IfRhosrProps> = ({registry, scope, onHasAccess, children}: IfRhosrProps) => {
    const [isLoading, setLoading] = useState<boolean>(false);
    const [userInfo, setUserInfo] = useState<UserInfo>();

    const rhosrFactory: RhosrInstanceServiceFactory = useRhosrInstanceServiceFactory();

    const userHasAccess = (): boolean => {
        switch (scope) {
            case "read":
                return (userInfo?.viewer||false) || (userInfo?.developer||false) || (userInfo?.admin||false);
            case "write":
                return (userInfo?.developer||false) || (userInfo?.admin||false);
            case "admin":
                return (userInfo?.admin||false);
        }
        return false;
    };

    useEffect(() => {
        setLoading(true);
        rhosrFactory.createFor(registry).getCurrentUser().then(userInfo => {
            setUserInfo(userInfo);
            if (onHasAccess) {
                onHasAccess(userHasAccess());
            }
            setLoading(false);
        }).catch(error => {
            console.info("[IfRhosr] Error response getting user info for registry instance: ", error);
            setUserInfo({
                admin: false,
                developer: false,
                viewer: false,
                displayName: "",
                username: ""
            });
            if (onHasAccess) {
                onHasAccess(false);
            }
            setLoading(false);
        });
    }, [registry]);

    return (
        <IsLoading condition={isLoading}>
            {
                userHasAccess() ? (
                    <React.Fragment children={children}/>
                ) : (
                    <Alert variant="warning" isInline={true} title="Permission denied (no access)">
                        <p>
                            You do not have sufficient access privileges to Service Registry instance '{registry.name}'.
                            Please contact your organization admin or the owner of the Service Registry instance to be
                            granted appropriate access.
                        </p>
                    </Alert>
                )
            }
        </IsLoading>
    );
};
