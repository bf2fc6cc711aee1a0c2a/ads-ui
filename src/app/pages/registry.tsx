import React, {FunctionComponent, useEffect, useState} from "react";
import {
    Button,
    EmptyState,
    EmptyStateBody,
    EmptyStateIcon,
    EmptyStateVariant,
    Spinner,
    Title
} from "@patternfly/react-core";
import {CubesIcon} from "@patternfly/react-icons";
import {Registry} from "@rhoas/registry-management-sdk";
import {
    RhosrInstanceService,
    RhosrInstanceServiceFactory,
    RhosrService,
    useRhosrInstanceServiceFactory,
    useRhosrService
} from "@app/services";
import {If} from "@app/components";
import {ArtifactsSearchResults, GetArtifactsCriteria, Paging} from "@app/models/rhosr-instance";

export type RegistryPageProps = {
    params: any;
};

export const RegistryPage: FunctionComponent<RegistryPageProps> = ({params}: RegistryPageProps) => {
    const [ loading, setLoading ] = useState(true);
    const [ registry, setRegistry ] = useState(undefined as Registry|undefined);
    const [ artifacts, setArtifacts ] = useState(undefined as ArtifactsSearchResults|undefined);

    const registryId: string = params["registryId"];

    const rhosr: RhosrService = useRhosrService();
    const rhosrIntanceFactory: RhosrInstanceServiceFactory = useRhosrInstanceServiceFactory();

    useEffect(() => {
        // Get a single Registry by ID
        rhosr.getRegistry(registryId).then(registry => {
            console.debug("[RegistryPage] Registry: ", registry);
            setRegistry(registry);
        }).catch(error => {
            // TODO handle this error case
            console.error("[HomePage] Error getting registry list: ", error);
        });
    }, [registryId]);

    useEffect(() => {
        if (registry) {
            console.info("[RegistryPage] Registry changed, getting artifact list.");
            const rhosrInstance: RhosrInstanceService = rhosrIntanceFactory.createFor(registry);
            const criteria: GetArtifactsCriteria = {
                sortAscending: true,
                type: "",
                value: ""
            };
            const paging: Paging = {
                page: 1,
                pageSize: 20
            };
            rhosrInstance.getArtifacts(criteria, paging).then(results => {
                setArtifacts(results);
                setLoading(false);
                console.debug("[RegistryPage] Artifacts: ", results);
            });
        }
    }, [registry]);

    return (
        <React.Fragment>
            <If condition={loading}>
                <Spinner />
            </If>
            <If condition={!loading}>
                <EmptyState variant={EmptyStateVariant.xl}>
                    <EmptyStateIcon icon={CubesIcon} />
                    <Title headingLevel="h5" size="4xl">
                        API Designer - Registry Page
                    </Title>
                    <EmptyStateBody>
                        ({artifacts?.artifacts.length} artifacts were found, nice work.)
                    </EmptyStateBody>
                    <Button variant="primary">Primary action</Button>
                </EmptyState>
            </If>
        </React.Fragment>
    );
}
