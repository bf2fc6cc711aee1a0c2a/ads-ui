import React, {FunctionComponent, useState} from "react";
import "./home.css";
import {
    Button,
    Flex,
    FlexItem,
    Grid,
    GridItem,
    PageSection,
    PageSectionVariants,
    Popover,
    Text,
    TextContent
} from "@patternfly/react-core";
import {
    CreateDesignModal,
    DesignsPanel,
    ImportDesignModal,
    ImportFrom,
    ImportFromRhosrModal
} from "@app/pages/components";
import {CreateDesign, CreateDesignContent, Template} from "@app/models";
import {cloneObject, propertyReplace} from "@app/utils";
import {DesignsService, useDesignsService} from "@app/services";
import {Navigation, useNavigation} from "@app/contexts/navigation";
import {QuestionCircleIcon} from "@patternfly/react-icons";

export type HomePageProps = {
};

export const HomePage: FunctionComponent<HomePageProps> = ({}: HomePageProps) => {
    const [ isCreateModalOpen, setCreateModalOpen ] = useState(false);
    const [ isImportModalOpen, setImportModalOpen ] = useState(false);
    const [ isImportFromRhosrModalOpen, setImportFromRhosrModalOpen ] = useState(false);
    const [ importType, setImportType ] = useState<ImportFrom>(ImportFrom.FILE);

    const designsSvc: DesignsService = useDesignsService();
    const nav: Navigation = useNavigation();

    const onImport = (from: ImportFrom): void => {
        setImportType(from);
        if (from !== ImportFrom.RHOSR) {
            setImportModalOpen(true);
        } else {
            setImportFromRhosrModalOpen(true);
        }
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
                    <Flex>
                        <FlexItem>
                            <Text component="h1" className="title">API Designs</Text>
                        </FlexItem>
                        <FlexItem>
                            <Popover
                                aria-label="More information"
                                headerContent={<div>API Designer Help</div>}
                                bodyContent={<div>A tool to design your APIs (OpenAPI, AsyncAPI) and schemas (Apache Avro, Google Protobuf, JSON Schema). Manage your collection of API and schema designs below by creating, importing, and editing.</div>}
                            >
                                <Button variant="plain"><QuestionCircleIcon /></Button>
                            </Popover>
                        </FlexItem>
                    </Flex>
                </TextContent>
                {/*<Grid hasGutter={true}>*/}
                {/*    <GridItem span={11}>*/}
                {/*        <ActionList className="summary-actions">*/}
                {/*            <ActionListItem>*/}
                {/*                <Button className="btn-create" variant="primary" onClick={() => setCreateModalOpen(true)}>Create a schema or API design</Button>*/}
                {/*            </ActionListItem>*/}
                {/*            <ActionListItem>*/}
                {/*                <ImportDropdown onImportFromFile={onImportFromFile} onImportFromUrl={onImportFromUrl} onImportFromRhosr={onImportFromRhosr} />*/}
                {/*            </ActionListItem>*/}
                {/*        </ActionList>*/}
                {/*    </GridItem>*/}
                {/*</Grid>*/}
                <CreateDesignModal isOpen={isCreateModalOpen} onCreate={createDesign} onCancel={() => {setCreateModalOpen(false)}} />
                <ImportDesignModal isOpen={isImportModalOpen} onImport={importDesign} onCancel={() => {setImportModalOpen(false)}}
                                  importType={importType} />
                <ImportFromRhosrModal isOpen={isImportFromRhosrModalOpen} onImport={importDesign} onCancel={() => {setImportFromRhosrModalOpen(false)}} />
            </PageSection>
            <PageSection variant={PageSectionVariants.default} isFilled={true}>
                <Grid hasGutter={true}>
                    <GridItem span={12}>
                        <DesignsPanel onCreate={() => {setCreateModalOpen(true)}}
                                      onImport={onImport} />
                    </GridItem>
                </Grid>
            </PageSection>
        </React.Fragment>
    );
}
