import React, {FunctionComponent, useEffect, useState} from "react";
import "./editor-context.css";
import {ArtifactTypes, Design} from "@app/models";
import {
    Breadcrumb,
    BreadcrumbItem,
    Button,
    Dropdown,
    DropdownItem, Gallery, GalleryItem,
    MenuToggle,
    Text,
    TextContent
} from "@patternfly/react-core";
import {If, NavLink, ToggleIcon} from "@app/components";
import Moment from "react-moment";
import {LocalStorageService, useLocalStorageService} from "@app/services";
import {DesignContext} from "@app/models/designs/design-context.model";
import {ExportToRhosrData, ExportToRhosrModal} from "@app/pages/components";

/**
 * Properties
 */
export type EditorContextProps = {
    design: Design;
    dirty: boolean;
    onSave: () => void;
    onCancel: () => void;
}

/**
 * The context of the design when editing a design on the editor page.
 */
export const EditorContext: FunctionComponent<EditorContextProps> = ({design, dirty, onSave, onCancel}: EditorContextProps) => {
    const lss: LocalStorageService = useLocalStorageService();

    const [designContext, setDesignContext] = useState<DesignContext>();
    const [isActionMenuToggled, setActionMenuToggled] = useState(false);
    const [isExpanded, setExpanded] = useState(lss.getConfigProperty("editor-context.isExpanded", "false") === "true");
    const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);

    const onActionMenuToggle = (): void => {
        setActionMenuToggled(!isActionMenuToggled);
    };

    const onToggleExpand = (): void => {
        const newExpanded: boolean = !isExpanded;
        lss.setConfigProperty("editor-context.isExpanded", "" + newExpanded);
        setExpanded(newExpanded);
    };

    const actionMenuToggle: React.ReactNode = (
        <MenuToggle variant="secondary" onClick={onActionMenuToggle} isExpanded={isActionMenuToggled}>Actions</MenuToggle>
    );

    const onActionMenuSelect = (event?: React.SyntheticEvent<HTMLDivElement>): void => {
        // @ts-ignore
        const action: string = event?.target.attributes["data-id"].value;
        setActionMenuToggled(false);
        switch (action) {
            case "action-compare":
                return;
            case "action-validate":
                return;
            case "action-compatibility":
                return;
            case "action-export-to-rhosr":
                setRegisterModalOpen(true);
                return;
        }
    };

    const typeForDisplay = (): string => {
        switch (design.type) {
            case ArtifactTypes.OPENAPI:
                return "OpenAPI";
            case ArtifactTypes.ASYNCAPI:
                return "AsyncAPI";
            case ArtifactTypes.AVRO:
                return "Apache Avro";
            case ArtifactTypes.JSON:
                return "JSON Schema";
            case ArtifactTypes.PROTOBUF:
                return "Google Protocol Buffers";
        }
        return "N/A";
    };

    const hasRhosrContext = (): boolean => {
        return designContext !== undefined && designContext.type && designContext.type === "rhosr";
    };

    const hasFileContext = (): boolean => {
        return designContext !== undefined && designContext.type && designContext.type === "file";
    };

    const hasUrlContext = (): boolean => {
        return designContext !== undefined && designContext.type && designContext.type === "url";
    };

    const onRegisterDesignConfirmed = (event: ExportToRhosrData): void => {
        // TODO anything to do here other than close the modal?
        setRegisterModalOpen(false);
    };

    useEffect(() => {
        if (design) {
            const context: DesignContext|undefined = (design.contexts && design.contexts.length > 0) ? design.contexts[0] : undefined;
            setDesignContext(context);
        }
    }, [design]);

    return (
        <React.Fragment>
            <div className="editor-context">
                <div className="editor-context-breadcrumbs">
                    <Breadcrumb style={{marginBottom: "10px"}}>
                        <BreadcrumbItem component="button">
                            <NavLink location="/">Red Hat OpenShift API Designer</NavLink>
                        </BreadcrumbItem>
                        <BreadcrumbItem isActive={true}>{design?.name}</BreadcrumbItem>
                    </Breadcrumb>
                </div>
                <div className="editor-context-last-modified">
                    <span>Last modified:</span>
                    <Moment date={design.modifiedOn} fromNow={true} />
                </div>
                <div className="editor-context-actions">
                    <Dropdown
                        onSelect={onActionMenuSelect}
                        toggle={actionMenuToggle}
                        isOpen={isActionMenuToggled}
                        isPlain
                        dropdownItems={
                            [
                                <DropdownItem key="action-export-to-rhosr" data-id="action-export-to-rhosr">Export to Service Registry</DropdownItem>,
                                <DropdownItem key="action-compare" data-id="action-compare">Compare differences</DropdownItem>,
                                <DropdownItem key="action-validate" data-id="action-validate">Validate</DropdownItem>,
                                <DropdownItem key="action-compatibility" data-id="action-compatibility">Check compatibility</DropdownItem>,
                            ]
                        }
                    />
                </div>
                <div className="editor-context-save">
                    <Button className="btn-save" variant="primary" onClick={onSave} isDisabled={!dirty}>Save</Button>
                </div>
                <div className="editor-context-toggle">
                    <Button className="btn-toggle" variant="plain" onClick={onToggleExpand}>
                        <ToggleIcon expanded={isExpanded} onClick={() => { setExpanded(!isExpanded) }} />
                    </Button>
                </div>
            </div>
            <If condition={isExpanded}>
                <div className="editor-context-details">
                    <TextContent>
                        <Text component="h1" className="title">{design?.name}</Text>
                        <Text component="p" className="summary">{design?.summary || "(Design or schema with no summary)"}</Text>
                    </TextContent>
                    <Gallery className="metadata" minWidths={{default: "300px"}}>
                        <GalleryItem className="md-property">
                            <span className="md-name">Type</span>
                            <span className="md-value">{typeForDisplay()}</span>
                        </GalleryItem>
                        <If condition={hasRhosrContext}>
                            <GalleryItem className="md-property">
                                <span className="md-name">Group ID</span>
                                <span className="md-value">{designContext?.rhosr?.groupId || "default"}</span>
                            </GalleryItem>
                            <GalleryItem className="md-property">
                                <span className="md-name">Artifact ID</span>
                                <span className="md-value">{designContext?.rhosr?.artifactId}</span>
                            </GalleryItem>
                            <GalleryItem className="md-property">
                                <span className="md-name">Version</span>
                                <span className="md-value">{designContext?.rhosr?.version || "latest"}</span>
                            </GalleryItem>
                        </If>
                        <If condition={hasFileContext}>
                            <GalleryItem className="md-property">
                                <span className="md-name">Filename</span>
                                <span className="md-value">{designContext?.file?.fileName}</span>
                            </GalleryItem>
                        </If>
                        <If condition={hasUrlContext}>
                            <GalleryItem className="md-property">
                                <span className="md-name">URL</span>
                                <span className="md-value">{designContext?.url?.url}</span>
                            </GalleryItem>
                        </If>
                    </Gallery>
                </div>
            </If>
            <ExportToRhosrModal design={design as Design}
                                isOpen={isRegisterModalOpen}
                                onExported={onRegisterDesignConfirmed}
                                onCancel={() => setRegisterModalOpen(false)} />
        </React.Fragment>
    );
};
