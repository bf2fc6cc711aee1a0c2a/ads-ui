import React, {FunctionComponent, useEffect, useState} from "react";
import {Breadcrumb, BreadcrumbItem, PageSection, PageSectionVariants, Text, TextContent} from "@patternfly/react-core";
import {Registry} from "@rhoas/registry-management-sdk";
import {
    RhosrInstanceService,
    RhosrInstanceServiceFactory,
    RhosrService,
    useRhosrInstanceServiceFactory,
    useRhosrService
} from "@app/services";
import {IfNotEmpty, IsLoading} from "@app/components";
import {ArtifactsSearchResults, GetArtifactsCriteria, Paging} from "@app/models/rhosr-instance";
import {ArtifactsToolbar, ArtifactsToolbarCriteria, ArtifactsList} from "@app/pages/components";

export type RegistryPageProps = {
    params: any;
};


export const RegistryPage: FunctionComponent<RegistryPageProps> = ({params}: RegistryPageProps) => {
    const [ loading, setLoading ] = useState(true);
    const [ querying, setQuerying ] = useState(true);
    const [ paging, setPaging ] = useState<Paging>({
        pageSize: 20,
        page: 1
    });
    const [ criteria, setCriteria ] = useState<ArtifactsToolbarCriteria>({
        filterValue: "",
        ascending: true,
        filterSelection: "name"
    });
    const [ registry, setRegistry ] = useState<Registry|undefined>();
    const [ artifacts, setArtifacts ] = useState<ArtifactsSearchResults|undefined>();

    const [ rhosrInstance, setRhosrInstance ] = useState<RhosrInstanceService>();

    const rhosr: RhosrService = useRhosrService();
    const rhosrIntanceFactory: RhosrInstanceServiceFactory = useRhosrInstanceServiceFactory();

    // Load the registry based on the registry ID (from the path param).
    useEffect(() => {
        const registryId: string = params["registryId"];

        rhosr.getRegistry(registryId).then(registry => {
            setRegistry(registry);
            setLoading(false);
        }).catch(error => {
            // TODO handle this error case
            console.error("[RegistryPage] Error getting registry: ", error);
        });
    }, [params]);

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
    }, [rhosrInstance, criteria, paging]);

    const onCriteriaChange = (criteria: ArtifactsToolbarCriteria): void =>  {
        setCriteria(criteria);
    };

    const onPagingChange = (paging: Paging): void => {
        setPaging(paging);
    };

    return (
        <React.Fragment>
            <IsLoading condition={loading}>
                <PageSection variant={PageSectionVariants.light}>
                    <Breadcrumb style={{marginBottom: "10px"}}>
                        <BreadcrumbItem to="/">Red Hat OpenShift API Designer</BreadcrumbItem>
                        <BreadcrumbItem isActive={true}>Service Registries</BreadcrumbItem>
                        <BreadcrumbItem isActive={true}>{registry?.name}</BreadcrumbItem>
                    </Breadcrumb>
                    <TextContent>
                        <Text component="h1">{registry?.name}</Text>
                    </TextContent>
                </PageSection>
                <PageSection variant={PageSectionVariants.default} isFilled={true}>
                    <ArtifactsToolbar criteria={criteria} paging={paging}
                                      onCriteriaChange={onCriteriaChange} onPagingChange={onPagingChange}
                                      artifacts={artifacts} />
                    <IsLoading condition={querying}>
                        <IfNotEmpty collection={artifacts?.artifacts} emptyStateMessage={`No artifacts found matching the search criteria.`}>
                            <ArtifactsList artifacts={artifacts?.artifacts} />
                        </IfNotEmpty>
                    </IsLoading>
                </PageSection>
            </IsLoading>
        </React.Fragment>
    );
}
