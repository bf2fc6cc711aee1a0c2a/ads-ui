import React, { FunctionComponent, useEffect, useState } from "react";
import { DesignContext } from "@app/models/designs/design-context.model";
import { RhosrService, useRhosrService } from "@app/services";
import { stripTrailingSlash } from "@app/utils";
import { Registry } from "@rhoas/registry-management-sdk";

/**
 * Properties
 */
export type RegistryNavLinkProps = {
    registry?: Registry;
    context: DesignContext | undefined;
    children?: React.ReactNode;
};

/**
 * A navigation link to an artifact in a service registry instance.  The context passed to this
 * component must be of type "rhosr".
 */
export const RegistryNavLink: FunctionComponent<RegistryNavLinkProps> = ({ registry, context, children }: RegistryNavLinkProps) => {
    const [href, setHref] = useState<string>();

    const rhosr: RhosrService | undefined = registry === undefined ? useRhosrService() : undefined;

    const setHrefFrom = (registry: Registry, context: DesignContext): void => {
        const group: string = context.rhosr?.groupId || "default";
        const id: string = context.rhosr?.artifactId as string;
        setHref(`${stripTrailingSlash(registry.browserUrl)}/artifacts/${group}/${id}`);
    };

    useEffect(() => {
        setHref(undefined);
        if (context?.type === "rhosr") {
            if (registry) {
                setHrefFrom(registry, context);
            } else {
                (rhosr as RhosrService).getRegistry(context.rhosr?.instanceId as string).then(registry => {
                    setHrefFrom(registry, context);
                });
            }
        }
    }, [context]);

    return (
        href ? <a href={href} children={children} /> : <span children={children} />
    );
};
