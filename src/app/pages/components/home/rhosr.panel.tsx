import React, {FunctionComponent, useEffect, useState} from "react";
import {
    Button,
    Card,
    CardBody,
    CardTitle,
    EmptyState,
    EmptyStateBody,
    EmptyStateVariant, Spinner,
    Title
} from "@patternfly/react-core";
import {RhosrService, useRhosrService} from "@app/services/rhosr";
import {If} from "@app/components";
import {Registry} from "@rhoas/registry-management-sdk";
import {NavLink} from "@app/components/navlink";

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
                <If condition={loading}>
                    <Spinner />
                </If>
                <If condition={!loading && registries.length > 0}>
                    <div className="registries">
                        {
                            registries.map(registry =>
                                <div key={registry.id} className="registry">
                                    <NavLink location={`/registries/${registry.id}`}>{registry.name}</NavLink>
                                </div>
                            )
                        }
                    </div>
                </If>
                <If condition={!loading && registries.length === 0}>
                    <EmptyState variant={EmptyStateVariant.xs}>
                        <Title headingLevel="h4" size="md">
                            None found
                        </Title>
                        <EmptyStateBody>
                            Create a Service Registry instance to browse it for editable content.
                        </EmptyStateBody>
                        <Button variant="primary">Create registry</Button>
                    </EmptyState>
                </If>
            </CardBody>
        </Card>
    );
};
