import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import "./editor.css";
import { Button, CodeBlock, CodeBlockCode, DescriptionList, DescriptionListDescription, DescriptionListGroup, DescriptionListTerm, Divider, Drawer, DrawerActions, DrawerCloseButton, DrawerContent, DrawerHead, DrawerPanelBody, DrawerPanelContent, List, ListItem, PageSection, PageSectionVariants, SimpleListGroup, Spinner } from "@patternfly/react-core";
import { DesignsService, useDesignsService, useRhosrInstanceServiceFactory } from "@app/services";
import { ArtifactTypes, Design, DesignContent } from "@app/models";
import { IsLoading } from "@app/components";
import { EditorContext } from "@app/pages/components";
import { OpenApiEditor, ProtoEditor, TextEditor } from "@app/editors";
import { Navigation, useNavigation } from "@app/contexts/navigation";
import { AsyncApiEditor } from "@app/editors/editor-asyncapi";
import { Registry } from "@rhoas/registry-management-sdk";

export type EditorPageProps = {
    params: any;
    toggleExpandDryRunIssuesDrawer: (isExpanded: boolean) => void;
};

export interface DryRunErrorResponse {
    causes: [
        {
            description: string,
            context: string
        }
    ],
    message: string,
    error_code: number,
    detail: string,
    name: string
}

interface DryRunRequestParams {
    registry: Registry
    groupId: string | undefined
    artifactId: string
}

export const EditorPage: FunctionComponent<EditorPageProps> = ({ params }: EditorPageProps) => {
    const [isLoading, setLoading] = useState(true);
    const [design, setDesign] = useState<Design>();
    const [designContent, setDesignContent] = useState<DesignContent>();
    const [currentContent, setCurrentContent] = useState<any>();
    const [isDirty, setDirty] = useState(false);
    const [dryRunError, setDryRunError] = useState<DryRunErrorResponse>();
    const [registryDryRunArgsCache, setRegistryDryRunArgsCache] = useState<DryRunRequestParams>();
    const [isDryRunIssuesLoading, setDryRunIssuesIsLoading] = useState(false);
    const [isDryRunIssuesDrawerOpen, setDryRunIssuesDrawerIsOpen] = useState(false);

    const drawerRef = useRef<HTMLDivElement>();

    const designsService: DesignsService = useDesignsService();
    const rhosrInstanceFactory = useRhosrInstanceServiceFactory();

    const nav: Navigation = useNavigation();

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
            setDesign({
                ...design,
                modifiedOn: new Date()
            } as Design);
        }).catch(error => {
            // TODO handle error
            console.error("[EditorPage] Failed to save design content: ", error);
        });
    };

    // Called when the user makes an edit in the editor.
    const onCancel = (): void => {
        nav.navigateTo("/");
    };

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

    const onResizeDryRunSidepanel = (newWidth: number, id: string) => {
        // eslint-disable-next-line no-console
        console.log(`${id} has new width of: ${newWidth}`);
    };

    const artifactRegistrationDryRun = (registry: Registry, groupId: string | undefined, artifactId: string) => {
        setDryRunIssuesIsLoading(true);
        // cache registry used during dry-run to allow for a retry from the sidepanel
        setRegistryDryRunArgsCache({ registry, groupId, artifactId });
        rhosrInstanceFactory.createFor(registry)
            .testUpdateArtifactContent(groupId, artifactId, currentContent)
            .then(() => {
                openDryRunIssuesPanel();
            }).catch((error: DryRunErrorResponse) => {
                openDryRunIssuesPanel(error);
            });
    }

    const openDryRunIssuesPanel = (error?: DryRunErrorResponse) => {
        setDryRunIssuesDrawerIsOpen(true);
        setDryRunError(error);
        setDryRunIssuesIsLoading(false);
    }

    const closeDryRunIssuesPanel = () => {
        setDryRunIssuesDrawerIsOpen(false);
        setDryRunIssuesIsLoading(false);
        setDryRunError(undefined);
    }

    const renderPanelContent = (error?: DryRunErrorResponse) => {
        return (
            <DrawerPanelContent isResizable onResize={onResizeDryRunSidepanel} minSize='35%' id="dry-run-issues-panel">
                <DrawerHead>
                    <h2 className="pf-c-title pf-m-2xl" tabIndex={isDryRunIssuesDrawerOpen ? 0 : -1} ref={drawerRef as any}>
                        Registration dry-run issues
                    </h2>
                    <DrawerActions>
                        <Button variant='secondary' onClick={() => artifactRegistrationDryRun(
                            registryDryRunArgsCache?.registry as Registry,
                            registryDryRunArgsCache?.groupId,
                            registryDryRunArgsCache?.artifactId as string
                        )
                        }>Retry</Button>
                        <DrawerCloseButton onClick={closeDryRunIssuesPanel} />
                    </DrawerActions>
                </DrawerHead>
                <Divider />
                <DrawerPanelBody>
                    {renderPanelBody(error)}
                </DrawerPanelBody>
            </DrawerPanelContent>
        )
    };

    const renderPanelBody = (error?: DryRunErrorResponse) => {
        if (isDryRunIssuesLoading) {
            return <Spinner className='spinner' />
        } else if (error) {
            return <DescriptionList isHorizontal>
                {error.name === 'RuleViolationException' && error.causes?.length > 0 ?
                    error.causes.map((cause, i) =>
                        <React.Fragment key={'issue-' + i}>
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

        return <p>Artifact registration dry-run completed with no issues.</p>;
    }

    return (
        <IsLoading condition={isLoading}>
            <PageSection variant={PageSectionVariants.light} id="section-context">
                <EditorContext
                    design={design as Design}
                    dirty={isDirty}
                    onSave={onSave}
                    onCancel={onCancel}
                    isPanelOpen={isDryRunIssuesDrawerOpen}
                    onRegistrationDryRun={artifactRegistrationDryRun}
                    onExpandDryRunCausesPanel={(error: DryRunErrorResponse) => openDryRunIssuesPanel(error)}
                    artifactContent={currentContent}

                />
            </PageSection>
            <PageSection variant={PageSectionVariants.light} id="section-editor">
                <Drawer isExpanded={isDryRunIssuesDrawerOpen} isInline position='right'>
                    <DrawerContent panelContent={renderPanelContent(dryRunError)}>
                        <div className="editor-parent">
                            {editor()}
                        </div>
                    </DrawerContent>
                </Drawer>
            </PageSection>
        </IsLoading>
    );
}