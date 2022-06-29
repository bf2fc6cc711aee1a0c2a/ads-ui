import React, {FunctionComponent, useEffect, useRef, useState} from "react";
import "./editor.css";
import {
    Button,
    CodeBlock,
    CodeBlockCode,
    DescriptionList,
    DescriptionListDescription,
    DescriptionListGroup,
    DescriptionListTerm,
    Divider,
    Drawer,
    DrawerActions,
    DrawerCloseButton,
    DrawerContent,
    DrawerHead,
    DrawerPanelBody,
    DrawerPanelContent, Modal, ModalContent, ModalVariant,
    PageSection,
    PageSectionVariants,
    Spinner, ToggleGroup, ToggleGroupItem
} from "@patternfly/react-core";
import {
    AlertsService,
    DesignsService,
    DownloadService, useAlertsService,
    useDesignsService,
    useDownloadService,
    useRhosrInstanceServiceFactory,
    useLocalStorageService,
    LocalStorageService
} from "@app/services";
import {ArtifactTypes, ContentTypes, Design, DesignContent, TestRegistryErrorResponse} from "@app/models";
import {IsLoading} from "@app/components";
import {DeleteDesignModal, EditorContext, RenameData, RenameModal} from "@app/pages/components";
import {OpenApiEditor, ProtoEditor, TextEditor} from "@app/editors";
import {AsyncApiEditor} from "@app/editors/editor-asyncapi";
import {Registry} from "@rhoas/registry-management-sdk";
import {
    contentTypeForDesign,
    convertToValidFilename,
    fileExtensionForDesign,
    formatContent
} from "@app/utils";
import {Prompt} from "react-router-dom";
import {Navigation, useNavigation} from "@app/contexts/navigation";
import {EditorCompare} from "@app/editors/editor-compare";
import {editor} from "monaco-editor";
import IDiffEditorConstructionOptions = editor.IDiffEditorConstructionOptions;


export type EditorPageProps = {
    params: any;
    toggleExpandTestRegistryIssuesDrawer: (isExpanded: boolean) => void;
};


interface TestRegistryRequestParams {
    registry: Registry
    groupId: string | undefined
    artifactId: string
}


// Event listener used to prevent navigation when the editor is dirty
const onBeforeUnload = (e): void => {
    // Cancel the event
    e.preventDefault();
    // Chrome requires returnValue to be set
    e.returnValue = "";
}


export const EditorPage: FunctionComponent<EditorPageProps> = ({params}: EditorPageProps) => {
    const [isLoading, setLoading] = useState(true);
    const [design, setDesign] = useState<Design>();
    const [designContent, setDesignContent] = useState<DesignContent>();
    const [currentContent, setCurrentContent] = useState<any>();
    const [isDirty, setDirty] = useState(false);
    const [testRegistryError, setTestRegistryError] = useState<TestRegistryErrorResponse>();
    const [testRegistryArgsCache, setTestRegistryArgsCache] = useState<TestRegistryRequestParams>();
    const [isTestRegistryIssuesLoading, setTestRegistryIssuesIsLoading] = useState(false);
    const [isTestRegistryIssuesDrawerOpen, setTestRegistryIssuesDrawerIsOpen] = useState(false);
    const [isRenameModalOpen, setRenameModalOpen] = useState(false);
    const [isCompareContentEditor, setIsCompareContentEditor] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [diffEditorContentOptions, setDiffEditorContentOptions] = useState({
        renderSideBySide: true,
        automaticLayout: true,
        wordWrap: 'on',
        readOnly: true,
        inDiffEditor: true
    } as IDiffEditorConstructionOptions)

    const [isDiffInline, setIsDiffInline] = useState(false);
    const [isDiffWrapped, setIsDiffWrapped] = useState(false);

    const drawerRef = useRef<HTMLDivElement>();

    const designsService: DesignsService = useDesignsService();
    const rhosrInstanceFactory = useRhosrInstanceServiceFactory();
    const downloadSvc: DownloadService = useDownloadService();
    const navigation: Navigation = useNavigation();
    const alerts: AlertsService = useAlertsService();

    useEffect(() => {
        // Cleanup any possible event listener we might still have registered
        return () => {
            window.removeEventListener("beforeunload", onBeforeUnload);
        };
    }, []);

    // Load the design based on the design ID (from the path param).
    useEffect(() => {
        setLoading(true);
        const designId: string = params["designId"];

        designsService.getDesign(designId).then(design => {
            setDesign(design);
        }).catch(error => {
            // TODO handle error
            console.error(`[EditorPage] Failed to get design with id ${designId}: `, error);
        })
    }, [params]);

    // Add browser hook to prevent navigation and tab closing when the editor is dirty
    useEffect(() => {
        if (isDirty) {
            window.addEventListener("beforeunload", onBeforeUnload);
        } else {
            window.removeEventListener("beforeunload", onBeforeUnload);
        }
    }, [isDirty]);

    // Load the design content
    useEffect(() => {
        const designId: string = params["designId"];
        designsService.getDesignContent(designId).then(content => {
            setDesignContent(content);
            setLoading(false);
            setDirty(false);
            setCurrentContent(content.data);
        }).catch(error => {
            // TODO handle error
            console.error(`[EditorPage] Failed to get design content with id ${designId}: `, error);
        });
    }, [design])

    // Called when the user makes an edit in the editor.
    const onEditorChange = (value: any): void => {
        setCurrentContent(value);
        setDirty(true);
    }

    // Called when the user makes an edit in the editor.
    const onSave = (): void => {
        designsService.updateDesignContent({
            ...designContent as DesignContent,
            data: currentContent
        }).then(() => {
            if (design) {
                design.modifiedOn = new Date();
                setDesign(design);
                setDirty(false);
            }
            alerts.designSaved(design as Design);
        }).catch(error => {
            // TODO handle error
            console.error("[EditorPage] Failed to save design content: ", error);
        });
    };

    const onFormat = (): void => {
        console.info("[EditorPage] Formatting content.");
        const formattedContent: string = formatContent(currentContent, designContent?.contentType || ContentTypes.APPLICATION_JSON);
        console.info("[EditorPage] New content is: ", formattedContent);
        setDesignContent({
            ...designContent as DesignContent,
            data: formattedContent
        });
        setCurrentContent(formattedContent);
    };

    const onDelete = (): void => {
        setDeleteModalOpen(true);
    };

    const onDeleteDesignConfirmed = (design: Design): void => {
        designsService.deleteDesign(design.id).then(() => {
            alerts.designDeleted(design as Design);
            navigation.navigateTo("/");
        }).catch(error => {
            console.error("[Editor] Design delete failed: ", error);
            alerts.designDeleteFailed(design as Design, error);
        });
        setDeleteModalOpen(false);
    };

    const onDownload = (): void => {
        if (design && designContent) {
            const filename: string = `${convertToValidFilename(design.name)}.${fileExtensionForDesign(design, designContent)}`;
            const contentType: string = contentTypeForDesign(design, designContent);
            const theContent: string = typeof currentContent === "object" ? JSON.stringify(currentContent, null, 4) : currentContent as string;
            downloadSvc.downloadToFS(design, theContent, contentType, filename);
        }
    };

    const doRenameDesign = (event: RenameData): void => {
        designsService.renameDesign(design?.id as string, event.name, event.summary).then(() => {
            if (design) {
                design.name = event.name;
                design.summary = event.summary;
            }
            setRenameModalOpen(false);
            alerts.designRenamed(event);
        }).catch(e => {
            // TODO error handling
        });
    }

    const compareEditor = (updatedContent, currentContent): React.ReactElement => {
        return <EditorCompare currentContent={currentContent} updatedContent={updatedContent}
                              contentOptions={diffEditorContentOptions}/>
    }

    const textEditor: React.ReactElement = (
        <TextEditor content={designContent as DesignContent} onChange={onEditorChange}/>
    );

    const protoEditor: React.ReactElement = (
        <ProtoEditor content={designContent as DesignContent} onChange={onEditorChange}/>
    );

    const openapiEditor: React.ReactElement = (
        <OpenApiEditor content={designContent as DesignContent} onChange={onEditorChange}/>
    );

    const asyncapiEditor: React.ReactElement = (
        <AsyncApiEditor content={designContent as DesignContent} onChange={onEditorChange}/>
    );

    const editor = (): React.ReactElement => {
        if (design?.type === ArtifactTypes.OPENAPI) {
            return openapiEditor;
        } else if (design?.type === ArtifactTypes.ASYNCAPI) {
            return asyncapiEditor;
        } else if (design?.type === ArtifactTypes.PROTOBUF) {
            return protoEditor;
        }

        // TODO create different text editors depending on the content type?  Or assume
        // that the text editor can configure itself appropriately?
        return textEditor;
    };

    const onResizeTestRegistrySidepanel = (newWidth: number, id: string) => {
        // eslint-disable-next-line no-console
        console.log(`${id} has new width of: ${newWidth}`);
    };

    const onCompareContent = () => {
        setIsCompareContentEditor(true);
    }

    const closeCompareEditor = () => {
        setIsCompareContentEditor(false);
    }

    const switchInlineCompare = () => {
        setDiffEditorContentOptions({
            ...diffEditorContentOptions as IDiffEditorConstructionOptions,
            renderSideBySide: !diffEditorContentOptions.renderSideBySide
        });
        setIsDiffInline(!!diffEditorContentOptions.renderSideBySide);
    }

    const switchWordWrap = () => {
        setDiffEditorContentOptions({
            ...diffEditorContentOptions as IDiffEditorConstructionOptions,
            wordWrap: diffEditorContentOptions.wordWrap == "off" ? "on" : "off"
        });
        setIsDiffWrapped(diffEditorContentOptions.wordWrap != "on");
    }

    const testArtifactRegistration = (registry: Registry, groupId: string | undefined, artifactId: string) => {
        setTestRegistryIssuesIsLoading(true);
        openTestRegistryIssuesPanel();
        // cache registry used during registry test to allow for a retry from the sidepanel
        setTestRegistryArgsCache({registry, groupId, artifactId});
        rhosrInstanceFactory.createFor(registry)
            .testUpdateArtifactContent(groupId, artifactId, currentContent)
            .then(() => {
                // Nothing to do here.
            }).catch((error: TestRegistryErrorResponse) => {
            openTestRegistryIssuesPanel(error);
        });
    }

    const openTestRegistryIssuesPanel = (error?: TestRegistryErrorResponse) => {
        setTestRegistryIssuesDrawerIsOpen(true);
        setTestRegistryError(error);
        setTestRegistryIssuesIsLoading(false);
    }

    const closeTestRegistryIssuesPanel = () => {
        setTestRegistryIssuesDrawerIsOpen(false);
        setTestRegistryIssuesIsLoading(false);
        setTestRegistryError(undefined);
    }

    const renderPanelContent = (error?: TestRegistryErrorResponse) => {
        return (
            <DrawerPanelContent isResizable onResize={onResizeTestRegistrySidepanel} minSize="35%"
                                id="test-registry-issues-panel">
                <DrawerHead>
                    <h2 className="pf-c-title pf-m-2xl" tabIndex={isTestRegistryIssuesDrawerOpen ? 0 : -1}
                        ref={drawerRef as any}>
                        Test Registration issues
                    </h2>
                    <DrawerActions>
                        <Button variant="secondary" onClick={() => testArtifactRegistration(
                            testRegistryArgsCache?.registry as Registry,
                            testRegistryArgsCache?.groupId,
                            testRegistryArgsCache?.artifactId as string
                        )
                        }>Retry</Button>
                        <DrawerCloseButton onClick={closeTestRegistryIssuesPanel}/>
                    </DrawerActions>
                </DrawerHead>
                <Divider/>
                <DrawerPanelBody>
                    {renderPanelBody(error)}
                </DrawerPanelBody>
            </DrawerPanelContent>
        )
    };

    const renderPanelBody = (error?: TestRegistryErrorResponse) => {
        if (isTestRegistryIssuesLoading) {
            return <Spinner className="spinner"/>
        } else if (error) {
            return <DescriptionList isHorizontal>
                {error.name === "RuleViolationException" && error.causes?.length > 0 ?
                    error.causes.map((cause, i) =>
                        <React.Fragment key={`issue-${i}`}>
                            <DescriptionListGroup>
                                <DescriptionListTerm>Code</DescriptionListTerm>
                                <DescriptionListDescription>{cause.description}</DescriptionListDescription>
                                <DescriptionListTerm>Context</DescriptionListTerm>
                                <DescriptionListDescription>
                                    <pre>{cause.context}</pre>
                                </DescriptionListDescription>
                            </DescriptionListGroup>
                            <Divider/>
                        </React.Fragment>
                    ) : <CodeBlock>
                        <CodeBlockCode id="code-content">{error.detail}</CodeBlockCode>
                    </CodeBlock>}
            </DescriptionList>
        }

        return <p>Registry Test completed with no issues.</p>;
    }

    return (
        <IsLoading condition={isLoading}>
            <PageSection variant={PageSectionVariants.light} id="section-context">
                <EditorContext
                    design={design as Design}
                    dirty={isDirty}
                    onSave={onSave}
                    onFormat={onFormat}
                    onDelete={onDelete}
                    onDownload={onDownload}
                    onRename={() => setRenameModalOpen(true)}
                    isPanelOpen={isTestRegistryIssuesDrawerOpen}
                    onRegistrationTestRegistry={testArtifactRegistration}
                    onCompareContent={onCompareContent}
                    onExpandTestRegistryCausesPanel={(error: TestRegistryErrorResponse) => openTestRegistryIssuesPanel(error)}
                    artifactContent={currentContent}
                />
            </PageSection>
            <PageSection variant={PageSectionVariants.light} id="section-editor">
                <Drawer isExpanded={isTestRegistryIssuesDrawerOpen} isInline={true} position="right">
                    <DrawerContent panelContent={renderPanelContent(testRegistryError)}>
                        <div className="editor-parent">
                            {editor()}
                        </div>
                    </DrawerContent>
                </Drawer>
            </PageSection>
            <Modal id={"compare-modal"}
                   isOpen={isCompareContentEditor}
                   onClose={closeCompareEditor}
                   actions={[
                       <Button key="cancel" variant="link" onClick={closeCompareEditor}>
                           Cancel
                       </Button>
                   ]}>
                <div id={"compare-view"}>
                    <ToggleGroup style={{float: "right", padding: "5px"}}
                                 aria-label="Default with multiple selectable">
                        <ToggleGroupItem text="Inline diff" key={1} buttonId="second"
                                         isSelected={isDiffInline}
                                         onChange={switchInlineCompare}/>
                        <ToggleGroupItem text="Wrap Text" key={0} buttonId="first"
                                         isSelected={isDiffWrapped}
                                         onChange={switchWordWrap}/>

                    </ToggleGroup>
                    <div id={"compare-editor"}>{compareEditor(currentContent, designContent)}</div>
                </div>
            </Modal>
            <RenameModal design={design}
                         isOpen={isRenameModalOpen}
                         onRename={doRenameDesign}
                         onCancel={() => setRenameModalOpen(false)}/>
            <DeleteDesignModal design={design}
                               isOpen={isDeleteModalOpen}
                               onDelete={onDeleteDesignConfirmed}
                               onDownload={onDownload}
                               onCancel={() => setDeleteModalOpen(false)}/>
            <Prompt when={isDirty} message={`You have unsaved changes.  Do you really want to leave?`}/>
        </IsLoading>
    );
}
