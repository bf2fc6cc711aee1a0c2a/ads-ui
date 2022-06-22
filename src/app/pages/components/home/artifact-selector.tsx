import React, {FunctionComponent, useEffect, useState} from "react";
import {Registry} from "@rhoas/registry-management-sdk";
import {
    ArtifactSearchResults,
    CreateDesignContent,
    GetArtifactsCriteria,
    Paging,
    SearchedArtifact,
    SearchedVersion
} from "@app/models";
import {RhosrInstanceService, RhosrInstanceServiceFactory, useRhosrInstanceServiceFactory} from "@app/services";
import {ArtifactList, ArtifactListToolbar, ArtifactListToolbarCriteria} from "@app/pages/components";
import {IfNotEmpty, IsLoading, ListWithToolbar} from "@app/components";
import {EmptyState, EmptyStateBody, EmptyStateVariant, Spinner, Title} from "@patternfly/react-core";

/**
 * Properties
 */
export type ArtifactSelectorProps = {
    registries: Registry[];
    onSelected: (registry?: Registry, artifact?: SearchedArtifact, version?: SearchedVersion, content?: CreateDesignContent) => void;
};

/**
 * A control that allows the user to find and select a single version of a single artifact from
 * a service registry instance.
 */
export const ArtifactSelector: FunctionComponent<ArtifactSelectorProps> = ({registries, onSelected}: ArtifactSelectorProps) => {
    const [ querying, setQuerying ] = useState(true);
    const [ paging, setPaging ] = useState<Paging>({
        pageSize: 20,
        page: 1
    });
    const [ criteria, setCriteria ] = useState<ArtifactListToolbarCriteria>({
        filterValue: "",
        ascending: true,
        filterSelection: "name"
    });
    const [ registry, setRegistry ] = useState<Registry>();
    const [ artifacts, setArtifacts ] = useState<ArtifactSearchResults|undefined>();
    const [ rhosrInstance, setRhosrInstance ] = useState<RhosrInstanceService>();

    const rhosrInstanceFactory: RhosrInstanceServiceFactory = useRhosrInstanceServiceFactory();

    const onRegistrySelected = (registry: Registry): void => {
        setRegistry(registry);
    };

    const onCriteriaChange = (criteria: ArtifactListToolbarCriteria): void =>  {
        setCriteria(criteria);
    };

    const onPagingChange = (paging: Paging): void => {
        setPaging(paging);
    };

    const fetchArtifactVersions = (artifact: SearchedArtifact): Promise<SearchedVersion[]> => {
        const ri: RhosrInstanceService = rhosrInstance as RhosrInstanceService;
        return ri.getArtifactVersions(artifact.groupId, artifact.id);
    };

    const fetchArtifactContent = (artifact: SearchedArtifact, version?: SearchedVersion): Promise<string> => {
        const ri: RhosrInstanceService = rhosrInstance as RhosrInstanceService;
        return ri.getArtifactContent(artifact.groupId, artifact.id, version?.version||"latest");
    };

    const onArtifactSelected = (artifact?: SearchedArtifact, version?: SearchedVersion, content?: CreateDesignContent): void => {
        onSelected(registry, artifact, version, content);
    };

    // Initialization
    useEffect(() => {
        if (registries && registries.length > 0) {
            setRegistry(registries[0]);
        }
    }, []);

    // Whenever the registry changes, create a rhosr instance service for it.
    useEffect(() => {
        if (registry) {
            const rhosrInstance: RhosrInstanceService = rhosrInstanceFactory.createFor(registry as Registry);
            setRhosrInstance(rhosrInstance);
        }
    }, [registry]);

    // Query for artifacts when relevant changes occur.
    useEffect(() => {
        if (rhosrInstance) {
            const gac: GetArtifactsCriteria = {
                sortAscending: criteria.ascending,
                type: criteria.filterSelection,
                value: criteria.filterValue
            };
            setQuerying(true);
            rhosrInstance.getArtifacts(gac, paging).then(results => {
                setArtifacts(results);
                setQuerying(false);
            }).catch(error => {
                // TODO handle error
                console.error("[RegistryPage] Error searching for artifacts: ", error);
            });
        }
        onSelected(undefined, undefined, undefined);
    }, [rhosrInstance, criteria, paging]);

    const toolbar: React.ReactNode = (
        <ArtifactListToolbar registries={registries} criteria={criteria} paging={paging}
                             onRegistrySelected={onRegistrySelected}
                             menuAppendTo={document.getElementById('artifact-selector')}
                             onCriteriaChange={onCriteriaChange} onPagingChange={onPagingChange}
                             artifacts={artifacts} />
    );

    const emptyState: React.ReactNode = (
        <EmptyState variant={EmptyStateVariant.xs}>
            <Title headingLevel="h4" size="md">{"None found"}</Title>
            <EmptyStateBody>{"No artifacts found in the registry instance."}</EmptyStateBody>
        </EmptyState>
    );

    const filteredEmptyState: React.ReactNode = (
        <EmptyState variant={EmptyStateVariant.xs}>
            <Title headingLevel="h4" size="md">{"None found"}</Title>
            <EmptyStateBody>{"No artifacts matched the filter criteria."}</EmptyStateBody>
        </EmptyState>
    );

    const loadingComponent: React.ReactNode = (
        <Spinner size="lg" style={{marginTop: "10px"}} />
    );

    return (
        <div id="artifact-selector">
            <ListWithToolbar toolbar={toolbar}
                alwaysShowToolbar={true}
                emptyState={emptyState}
                filteredEmptyState={filteredEmptyState}
                isFiltered={criteria.filterValue !== ""}
                isLoading={querying}
                loadingComponent={loadingComponent}
                isEmpty={!artifacts || artifacts.count === 0}
            >
                <ArtifactList artifacts={artifacts?.artifacts} fetchArtifactContent={fetchArtifactContent}
                    onArtifactSelected={onArtifactSelected}
                    fetchArtifactVersions={fetchArtifactVersions} />
            </ListWithToolbar>
        </div>
    );
};
