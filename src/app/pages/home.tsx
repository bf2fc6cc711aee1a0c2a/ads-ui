import React, {FunctionComponent, useState} from "react";
import "./home.css";
import {
    ActionList,
    ActionListItem,
    Button,
    Grid,
    GridItem,
    PageSection,
    PageSectionVariants,
    Text,
    TextContent
} from "@patternfly/react-core";
import {
    CreateDesignModal,
    DesignsPanel,
    ImportDesignModal,
    ImportDropdown,
    ImportFromRhosrModal
} from "@app/pages/components";
import {CreateDesign, CreateDesignContent, Template} from "@app/models";
import {cloneObject, propertyReplace} from "@app/utils";
import {DesignsService, useDesignsService} from "@app/services";
import {Navigation, useNavigation} from "@app/contexts/navigation";

export type HomePageProps = {
};

export const HomePage: FunctionComponent<HomePageProps> = ({}: HomePageProps) => {
    const [ isCreateModalOpen, setCreateModalOpen ] = useState(false);
    const [ isImportModalOpen, setImportModalOpen ] = useState(false);
    const [ isImportFromRhosrModalOpen, setImportFromRhosrModalOpen ] = useState(false);
    const [ importType, setImportType ] = useState<"FILE"|"URL">("FILE");

    const designsSvc: DesignsService = useDesignsService();
    const nav: Navigation = useNavigation();

    const onImportFromFile = (): void => {
        setImportType("FILE");
        setImportModalOpen(true);
    };
    const onImportFromUrl = (): void => {
        setImportType("URL");
        setImportModalOpen(true);
    };
    const onImportFromRhosr = (): void => {
        setImportFromRhosrModalOpen(true);
    };

    const createDesign = async (info: CreateDesign, template: Template): Promise<void> => {
        let dc: CreateDesignContent = {
            contentType: template.content.contentType,
            data: cloneObject(template.content.data)
        }
        if (typeof dc.data === "string") {
            dc.data = dc.data.replace("$NAME", info.name).replace("$SUMMARY", info.summary||"");
        } else {
            propertyReplace(dc.data, "$NAME", info.name);
            propertyReplace(dc.data, "$SUMMARY", info.summary||"");
        }
        return designsSvc.createDesign(info, dc).then((design) => {
            setCreateModalOpen(false);
            nav.navigateTo(`/designs/${design.id}/editor`);
        }).catch(error => {
            // TODO handle error
            console.error(error);
        });
    };

    const importDesign = async (event: CreateDesign, content: CreateDesignContent): Promise<void> => {
        return designsSvc.createDesign(event, content).then((design) => {
            setImportModalOpen(false);
            nav.navigateTo(`/designs/${design.id}/editor`);
        }).catch(error => {
            // TODO handle error
            console.error(error);
        });
    };

    return (
        <React.Fragment>
            <PageSection variant={PageSectionVariants.light} className="summary">
                <TextContent className="summary-title-and-description">
                    <Text component="h1" className="title">Red Hat OpenShift API Designer</Text>
                    <Text component="p" className="description">
                        A tool to design your APIs (OpenAPI, AsyncAPI) and schemas (Apache Avro, Google Protobuf, JSON Schema).
                        Manage your collection of API and schema designs below by creating, importing, and editing.
                    </Text>
                </TextContent>
                <Grid hasGutter={true}>
                    <GridItem span={11}>
                        <ActionList className="summary-actions">
                            <ActionListItem>
                                <Button className="btn-create" variant="primary" onClick={() => setCreateModalOpen(true)}>Create a schema or API design</Button>
                            </ActionListItem>
                            <ActionListItem>
                                <ImportDropdown onImportFromFile={onImportFromFile} onImportFromUrl={onImportFromUrl} onImportFromRhosr={onImportFromRhosr} />
                            </ActionListItem>
                        </ActionList>
                    </GridItem>
                </Grid>
                <CreateDesignModal isOpen={isCreateModalOpen} onCreate={createDesign} onCancel={() => {setCreateModalOpen(false)}} />
                <ImportDesignModal isOpen={isImportModalOpen} onImport={importDesign} onCancel={() => {setImportModalOpen(false)}}
                                  importType={importType} />
                <ImportFromRhosrModal isOpen={isImportFromRhosrModalOpen} onImport={importDesign} onCancel={() => {setImportFromRhosrModalOpen(false)}} />
            </PageSection>
            <PageSection variant={PageSectionVariants.default} isFilled={true}>
                <Grid hasGutter={true}>
                    <GridItem span={11}>
                        <DesignsPanel onCreate={() => {setCreateModalOpen(true)}} onImport={() => {setImportModalOpen(true)}} />
                    </GridItem>
                </Grid>
            </PageSection>
        </React.Fragment>
    );
}
