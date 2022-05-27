import React, {FunctionComponent, useEffect, useState} from "react";
import {Registry} from "@rhoas/registry-management-sdk";
import {
    ArtifactSearchResults,
    CreateDraftContent,
    GetArtifactsCriteria,
    Paging,
    SearchedArtifact,
    SearchedVersion
} from "@app/models";
import {RhosrInstanceService, RhosrInstanceServiceFactory, useRhosrInstanceServiceFactory} from "@app/services";
import {ArtifactList, ArtifactListToolbar, ArtifactListToolbarCriteria} from "@app/pages/components";
import {IfNotEmpty, IsLoading} from "@app/components";

/**
 * Properties
 */
export type ArtifactSelectorProps = {
    registries: Registry[];
    onSelected: (artifact?: SearchedArtifact, content?: CreateDraftContent) => void;
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

    const rhosrIntanceFactory: RhosrInstanceServiceFactory = useRhosrInstanceServiceFactory();

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

    // Initialization
    useEffect(() => {
        if (registries && registries.length > 0) {
            setRegistry(registries[0]);
        }
    }, []);

    // Whenever the registry changes, create a rhosr instance service for it.
    useEffect(() => {
        if (registry) {
            const rhosrInstance: RhosrInstanceService = rhosrIntanceFactory.createFor(registry as Registry);
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
        onSelected(undefined, undefined);
    }, [rhosrInstance, criteria, paging]);

    return (
        <React.Fragment>
            <ArtifactListToolbar registries={registries} criteria={criteria} paging={paging}
                                 onRegistrySelected={onRegistrySelected}
                                 onCriteriaChange={onCriteriaChange} onPagingChange={onPagingChange}
                                 artifacts={artifacts} />
            <IsLoading condition={querying}>
                <IfNotEmpty collection={artifacts?.artifacts} emptyStateMessage={`No artifacts found matching the search criteria.`}>
                    <ArtifactList artifacts={artifacts?.artifacts} fetchArtifactContent={fetchArtifactContent}
                                  onArtifactSelected={onSelected}
                                  fetchArtifactVersions={fetchArtifactVersions} />
                </IfNotEmpty>
            </IsLoading>
        </React.Fragment>
    );
};
