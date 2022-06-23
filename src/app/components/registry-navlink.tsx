import React, {FunctionComponent, useEffect, useState} from "react";
import {DesignContext} from "@app/models/designs/design-context.model";
import {RhosrService, useRhosrService} from "@app/services";
import {stripTrailingSlash} from "@app/utils";

/**
 * Properties
 */
export type RegistryNavLinkProps = {
    context: DesignContext | undefined;
    children?: React.ReactNode;
};

/**
 * A navigation link to an artifact in a service registry instance.  The context passed to this
 * component must be of type "rhosr".
 */
export const RegistryNavLink: FunctionComponent<RegistryNavLinkProps> = ({context, children}: RegistryNavLinkProps) => {
    const [href, setHref] = useState<string>();

    const rhosr: RhosrService = useRhosrService();

    useEffect(() => {
        setHref(undefined);
        if (context?.type === "rhosr") {
            rhosr.getRegistry(context.rhosr?.instanceId as string).then(registry => {
                const group: string = context.rhosr?.groupId as string;
                const id: string = context.rhosr?.artifactId as string;
                setHref(`${stripTrailingSlash(registry.browserUrl)}/artifacts/${group}/${id}`);
            });
        }
    }, [context]);

    return (
        href ? <a href={href} children={children} /> : <span children={children} />
    );
};
