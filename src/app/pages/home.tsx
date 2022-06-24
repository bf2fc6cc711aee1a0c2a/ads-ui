import React, {FunctionComponent, useRef, useState} from "react";
import "./home.css";
import {
    Button,
    Drawer,
    DrawerActions,
    DrawerCloseButton,
    DrawerContent,
    DrawerContentBody,
    DrawerHead,
    DrawerPanelBody,
    DrawerPanelContent,
    Flex,
    FlexItem,
    PageSection,
    PageSectionVariants,
    Popover,
    Text,
    TextContent,
    TextVariants,
    Title,
    TitleSizes
} from "@patternfly/react-core";
import {
    CreateDesignModal, DesignDetailsPanel,
    DesignsPanel,
    ImportDesignModal,
    ImportFrom,
    ImportFromRhosrModal
} from "@app/pages/components";
import {CreateDesign, CreateDesignContent, Design, Template} from "@app/models";
import {cloneObject, propertyReplace} from "@app/utils";
import {DesignsService, useDesignsService} from "@app/services";
import {Navigation, useNavigation} from "@app/contexts/navigation";
import {QuestionCircleIcon} from "@patternfly/react-icons";
import {ArtifactTypeIcon} from "@app/components";

export type HomePageProps = {
};

export const HomePage: FunctionComponent<HomePageProps> = ({}: HomePageProps) => {
    const [ isDrawerExpanded, setDrawerExpanded ] = useState(true);
    const [ isCreateModalOpen, setCreateModalOpen ] = useState(false);
    const [ isImportModalOpen, setImportModalOpen ] = useState(false);
    const [ isImportFromRhosrModalOpen, setImportFromRhosrModalOpen ] = useState(false);
    const [ importType, setImportType ] = useState<ImportFrom>(ImportFrom.FILE);
    const [ selectedDesign, setSelectedDesign ] = useState<Design>();

    const drawerRef: any = useRef<HTMLSpanElement>();

    const designsSvc: DesignsService = useDesignsService();
    const nav: Navigation = useNavigation();

    const onDrawerExpand = (): void => {
        drawerRef.current && drawerRef.current.focus();
    };

    const onDesignSelected = (design: Design | undefined): void => {
        setSelectedDesign(design);
        if (design) {
            setDrawerExpanded(true);
        } else {
            setDrawerExpanded(false);
        }
    };

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

    const importDesign = async (cd: CreateDesign, content: CreateDesignContent): Promise<void> => {
        return designsSvc.createDesign(cd, content).then((design) => {
            setImportModalOpen(false);
            nav.navigateTo(`/designs/${design.id}/editor`);
        }).catch(error => {
            // TODO handle error
            console.error(error);
        });
    };

    // The content of the side panel.  This should be a details panel with metadata and history (for example).
    const panelContent: React.ReactNode = (
        <DrawerPanelContent>
            <DrawerHead>
                <TextContent>
                    <Text component={TextVariants.small} className="pf-u-mb-0">
                        Name
                    </Text>
                    <Title
                        headingLevel="h2"
                        size={TitleSizes['xl']}
                        className="pf-u-mt-0"
                    >
                        <div className="design-details-header">
                            <div className="design-icon"><ArtifactTypeIcon type={selectedDesign?.type||"AVRO"} /></div>
                            <div className="design-name">{selectedDesign?.name}</div>
                        </div>
                    </Title>
                </TextContent>
                <DrawerActions>
                    <DrawerCloseButton onClick={() => onDesignSelected(undefined)} />
                </DrawerActions>
            </DrawerHead>
            <DrawerPanelBody>
                <DesignDetailsPanel design={selectedDesign} />
            </DrawerPanelBody>
        </DrawerPanelContent>
    );

    return (
        <React.Fragment>
            <Drawer isStatic={false} position="right" isInline={false} isExpanded={isDrawerExpanded} onExpand={onDrawerExpand}>
                <DrawerContent panelContent={panelContent}>
                    <DrawerContentBody>
                        <PageSection variant={PageSectionVariants.light} className="summary">
                            <TextContent className="summary-title-and-description">
                                <Flex>
                                    <FlexItem>
                                        <Text component="h1" className="title">API and Schema Designs</Text>
                                    </FlexItem>
                                    <FlexItem>
                                        <Popover
                                            aria-label="More information"
                                            headerContent={<div>API and Schema Designs</div>}
                                            bodyContent={<div>API Designer is a tool to design your APIs (OpenAPI, AsyncAPI) and schemas (Apache Avro, Google Protobuf, JSON Schema). Manage your collection of API and schema designs by creating, importing, and editing. Save your work by downloading your designs locally or by exporting them to OpenShift Service Registry.</div>}
                                        >
                                            <Button variant="plain"><QuestionCircleIcon /></Button>
                                        </Popover>
                                    </FlexItem>
                                </Flex>
                            </TextContent>
                            <CreateDesignModal isOpen={isCreateModalOpen} onCreate={createDesign} onCancel={() => {setCreateModalOpen(false)}} />
                            <ImportDesignModal isOpen={isImportModalOpen} onImport={importDesign} onCancel={() => {setImportModalOpen(false)}}
                                              importType={importType} />
                            <ImportFromRhosrModal isOpen={isImportFromRhosrModalOpen} onImport={importDesign} onCancel={() => {setImportFromRhosrModalOpen(false)}} />
                        </PageSection>
                        <PageSection variant={PageSectionVariants.default} isFilled={true}>
                            <DesignsPanel onCreate={() => {setCreateModalOpen(true)}}
                                          onDesignSelected={onDesignSelected}
                                          selectedDesign={selectedDesign}
                                          onImport={onImport} />
                        </PageSection>
                    </DrawerContentBody>
                </DrawerContent>
            </Drawer>
        </React.Fragment>
    );
}
