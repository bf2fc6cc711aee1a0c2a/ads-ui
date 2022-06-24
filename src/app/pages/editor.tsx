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
    DrawerPanelContent,
    PageSection,
    PageSectionVariants,
    Spinner
} from "@patternfly/react-core";
import {DesignsService, useDesignsService, useRhosrInstanceServiceFactory} from "@app/services";
import {ArtifactTypes, ContentTypes, Design, DesignContent, TestRegistryErrorResponse} from "@app/models";
import {IsLoading} from "@app/components";
import {EditorContext, RenameData, RenameModal} from "@app/pages/components";
import {OpenApiEditor, ProtoEditor, TextEditor} from "@app/editors";
import {AsyncApiEditor} from "@app/editors/editor-asyncapi";
import {Registry} from "@rhoas/registry-management-sdk";
import {formatContent} from "@app/utils";
import {AlertVariant, useAlert} from "@rhoas/app-services-ui-shared";
import {Prompt} from "react-router-dom";

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


export const EditorPage: FunctionComponent<EditorPageProps> = ({ params }: EditorPageProps) => {
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

    const drawerRef = useRef<HTMLDivElement>();

    const designsService: DesignsService = useDesignsService();
    const rhosrInstanceFactory = useRhosrInstanceServiceFactory();
    const { addAlert } = useAlert() || {};

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
            addAlert({
                title: `Design '${design?.name}' successfully saved.`,
                variant: AlertVariant.success,
                dataTestId: "toast-design-saved"
            });
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
    }

    const doRenameDesign = (event: RenameData): void => {
        designsService.renameDesign(design?.id as string, event.name, event.summary).then(() => {
            if (design) {
                design.name = event.name;
                design.summary = event.summary;
            }
            setRenameModalOpen(false);
            addAlert({
                title: `Design '${event.name}' successfully renamed.`,
                variant: AlertVariant.success,
                dataTestId: "toast-design-renamed"
            });
        }).catch(e => {
            // TODO error handling
        });
    }

    const textEditor: React.ReactElement = (
        <TextEditor content={designContent as DesignContent} onChange={onEditorChange} />
    );

    const protoEditor: React.ReactElement = (
        <ProtoEditor content={designContent as DesignContent} onChange={onEditorChange} />
    );

    const openapiEditor: React.ReactElement = (
        <OpenApiEditor content={designContent as DesignContent} onChange={onEditorChange} />
    );

    const asyncapiEditor: React.ReactElement = (
        <AsyncApiEditor content={designContent as DesignContent} onChange={onEditorChange} />
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

    const artifactRegistrationTestRegistry = (registry: Registry, groupId: string | undefined, artifactId: string) => {
        setTestRegistryIssuesIsLoading(true);
        // cache registry used during registry test to allow for a retry from the sidepanel
        setTestRegistryArgsCache({ registry, groupId, artifactId });
        rhosrInstanceFactory.createFor(registry)
            .testUpdateArtifactContent(groupId, artifactId, currentContent)
            .then(() => {
                openTestRegistryIssuesPanel();
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
            <DrawerPanelContent isResizable onResize={onResizeTestRegistrySidepanel} minSize="35%" id="test-registry-issues-panel">
                <DrawerHead>
                    <h2 className="pf-c-title pf-m-2xl" tabIndex={isTestRegistryIssuesDrawerOpen ? 0 : -1} ref={drawerRef as any}>
                        Test Registration issues
                    </h2>
                    <DrawerActions>
                        <Button variant="secondary" onClick={() => artifactRegistrationTestRegistry(
                            testRegistryArgsCache?.registry as Registry,
                            testRegistryArgsCache?.groupId,
                            testRegistryArgsCache?.artifactId as string
                        )
                        }>Retry</Button>
                        <DrawerCloseButton onClick={closeTestRegistryIssuesPanel} />
                    </DrawerActions>
                </DrawerHead>
                <Divider />
                <DrawerPanelBody>
                    {renderPanelBody(error)}
                </DrawerPanelBody>
            </DrawerPanelContent>
        )
    };

    const renderPanelBody = (error?: TestRegistryErrorResponse) => {
        if (isTestRegistryIssuesLoading) {
            return <Spinner className="spinner" />
        } else if (error) {
            return <DescriptionList isHorizontal>
                {error.name === "RuleViolationException" && error.causes?.length > 0 ?
                    error.causes.map((cause, i) =>
                        <React.Fragment key={`issue-${i}`}>
                            <DescriptionListGroup>
                                <DescriptionListTerm>Code</DescriptionListTerm>
                                <DescriptionListDescription>{cause.description}</DescriptionListDescription>
                                <DescriptionListTerm>Context</DescriptionListTerm>
                                <DescriptionListDescription><pre>{cause.context}</pre></DescriptionListDescription>
                            </DescriptionListGroup>
                            <Divider />
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
                    onRename={() => setRenameModalOpen(true)}
                    isPanelOpen={isTestRegistryIssuesDrawerOpen}
                    onRegistrationTestRegistry={artifactRegistrationTestRegistry}
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
            <RenameModal design={design}
                         isOpen={isRenameModalOpen}
                         onRename={doRenameDesign}
                         onCancel={() => setRenameModalOpen(false)} />
            <Prompt when={isDirty} message={`You have unsaved changes.  Do you really want to leave?`} />
        </IsLoading>
    );
}
