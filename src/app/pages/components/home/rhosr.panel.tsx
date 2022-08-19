import React, { FunctionComponent, useEffect, useState } from "react";
import { Card, CardBody, CardTitle } from "@patternfly/react-core";
import { RhosrService, useRhosrService } from "@app/services/rhosr";
import { IfNotEmpty, IsLoading, NavLink } from "@app/components";
import { Registry } from "@rhoas/registry-management-sdk";

export type RhosrPanelProps = {
}

export const RhosrPanel: FunctionComponent<RhosrPanelProps> = ({}: RhosrPanelProps) => {
    const [ loading, setLoading ] = useState(true);
    const [ registries, setRegistries ] = useState([] as Registry[]);

    const rhosr: RhosrService = useRhosrService();

    useEffect(() => {
        // Get the list of registries.
        rhosr.getRegistries().then(registries => {
            setRegistries(registries.sort((a, b) => {
                const name1: string = a.name as string;
                const name2: string = b.name as string;
                return name1.localeCompare(name2);
            }));
            setLoading(false);
        }).catch(error => {
            // TODO handle this error case
            console.error("[HomePage] Error getting registry list: ", error);
        });
    }, []);

    return (
        <Card isSelectable={false}>
            <CardTitle>Browse Service Registries</CardTitle>
            <CardBody>
                <IsLoading condition={loading}>
                    <IfNotEmpty collection={registries} emptyStateTitle={`None found`} emptyStateMessage={`Create a Service Registry instance to browse it for editable content.`}>
                        <div className="registries">
                            {
                                registries.map(registry =>
                                    <div key={registry.id} className="registry">
                                        <NavLink location={`/registries/${registry.id}`}>{registry.name}</NavLink>
                                    </div>
                                )
                            }
                        </div>
                    </IfNotEmpty>
                </IsLoading>
            </CardBody>
        </Card>
    );
};
