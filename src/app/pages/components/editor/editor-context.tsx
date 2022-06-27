import React, {FunctionComponent, useEffect, useState} from "react";
import "./editor-context.css";
import {ArtifactTypes, Design, TestRegistryErrorResponse} from "@app/models";
import {
    Breadcrumb,
    BreadcrumbItem,
    Button,
    Dropdown,
    DropdownItem,
    DropdownSeparator,
    DropdownToggle,
    Gallery,
    GalleryItem,
    Text,
    TextContent
} from "@patternfly/react-core";
import {DesignDescription, If, NavLink, ToggleIcon} from "@app/components";
import Moment from "react-moment";
import {DesignContext} from "@app/models/designs/design-context.model";
import {ExportToRhosrData, ExportToRhosrModal, TestRegistryModal} from "@app/pages/components";
import {AlertsService, LocalStorageService, useAlertsService, useLocalStorageService} from "@app/services";
import {Registry} from "@rhoas/registry-management-sdk";

/**
 * Properties
 */
export type EditorContextProps = {
    design: Design;
    dirty: boolean;
    artifactContent: string;
    onSave: () => void;
    onFormat: () => void;
    onDelete: () => void;
    onDownload: () => void;
    onRename: () => void;
    onExpandTestRegistryCausesPanel: (error: TestRegistryErrorResponse) => void;
    onRegistrationTestRegistry: (registry: Registry, group: string | undefined, artifactId: string) => void;
    isPanelOpen?: boolean;
}

type EditorContextMenuItem = {
    label?: string;
    key: string;
    isSeparator?: boolean;
    accept?: (design: Design) => boolean;
};

const menuActions: EditorContextMenuItem[] = [
    {
        label: "Rename design",
        key: "action-rename",
    },
    {
        label: "Format content",
        key: "action-format",
        accept: (design: Design) => { return [ArtifactTypes.AVRO, ArtifactTypes.JSON].includes(design.type); },
    },
    {
        label: "Show changes",
        key: "action-compare"
    },
    {
        key: "action-separator-1",
        isSeparator: true
    },
    {
        label: "Export to Service Registry",
        key: "action-export-to-rhosr",
    },
    {
        label: "Test using Service Registry",
        key: "action-test-registry"
    },
    {
        label: "Download design",
        key: "action-download"
    },
    {
        key: "action-separator-2",
        isSeparator: true
    },
    {
        label: "Delete design",
        key: "action-delete"
    },
];


/**
 * The context of the design when editing a design on the editor page.
 */
export const EditorContext: FunctionComponent<EditorContextProps> = (
    { design, dirty, onSave, onRegistrationTestRegistry, onFormat, onRename, onDownload, onDelete }: EditorContextProps) => {

    const lss: LocalStorageService = useLocalStorageService();

    const [designContext, setDesignContext] = useState<DesignContext>();
    const [isActionMenuToggled, setActionMenuToggled] = useState(false);
    const [isExpanded, setExpanded] = useState(lss.getConfigProperty("editor-context.isExpanded", "false") === "true");
    const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
    const [isTestRegistryModalOpen, setIsTestRegistryModalOpen] = useState(false);

    const alerts: AlertsService = useAlertsService();

    const onActionMenuToggle = (value: boolean): void => {
        setActionMenuToggled(value);
    };

    const onToggleExpand = (): void => {
        const newExpanded: boolean = !isExpanded;
        lss.setConfigProperty("editor-context.isExpanded", "" + newExpanded);
        setExpanded(newExpanded);
    };

    const actionMenuToggle: React.ReactNode = (
        <DropdownToggle id="action-toggle" toggleVariant="secondary" onToggle={onActionMenuToggle}>Actions</DropdownToggle>
    );

    const onActionMenuSelect = (event?: React.SyntheticEvent<HTMLDivElement>): void => {
        // @ts-ignore
        const action: string = event?.target.attributes["data-id"].value;
        console.info("=======> action: ", action);
        setActionMenuToggled(false);
        switch (action) {
            case "action-compare":
                return;
            case "action-export-to-rhosr":
                setRegisterModalOpen(true);
                return;
            case "action-format":
                onFormat();
                return;
            case "action-rename":
                onRename();
                return;
            case "action-delete":
                onDelete();
                return;
            case "action-download":
                onDownload();
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
        setRegisterModalOpen(false);
        alerts.designExportedToRhosr(event);
    };

    useEffect(() => {
        if (design) {
            const context: DesignContext|undefined = design.origin;
            setDesignContext(context);
        }
    }, [design]);

    const menuItems: any[] = menuActions.filter(action => !action.accept ? true : action.accept(design)).map(action => (
        action.isSeparator ? (
            <DropdownSeparator key={action.key} />
        ) : (
            <DropdownItem key={action.key} data-id={action.key}>{action.label}</DropdownItem>
        )
    ));

    return (
        <React.Fragment>
            <TestRegistryModal isOpen={isTestRegistryModalOpen}
                               design={design}
                               onCancel={() => setIsTestRegistryModalOpen(false)}
                               onSubmit={(...params) => {
                                    onRegistrationTestRegistry(...params);
                                    setIsTestRegistryModalOpen(false);
                               }} />
            <div className="editor-context">
                <div className="editor-context-breadcrumbs">
                    <Breadcrumb style={{ marginBottom: "10px" }}>
                        <BreadcrumbItem component="button">
                            <NavLink location="/">API and Schema Designs</NavLink>
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
                        style={{ zIndex: 1000 }}
                        isOpen={isActionMenuToggled}
                        isPlain
                        dropdownItems={menuItems}
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
                        <DesignDescription className="summary" description={design?.summary} />
                    </TextContent>
                    <Gallery className="metadata" minWidths={{ default: "300px" }}>
                        <GalleryItem className="md-property">
                            <span className="md-name">Type</span>
                            <span className="md-value">{typeForDisplay()}</span>
                        </GalleryItem>
                        <If condition={hasRhosrContext}>
                            <GalleryItem className="md-property">
                                <span className="md-name">Group</span>
                                <span className="md-value">{designContext?.rhosr?.groupId || "default"}</span>
                            </GalleryItem>
                            <GalleryItem className="md-property">
                                <span className="md-name">ID</span>
                                <span className="md-value">{designContext?.rhosr?.artifactId}</span>
                            </GalleryItem>
                            <GalleryItem className="md-property">
                                <span className="md-name">Version</span>
                                <span className="md-value">{designContext?.rhosr?.version || "latest"}</span>
                            </GalleryItem>
                        </If>
                        <If condition={hasFileContext}>
                            <GalleryItem className="md-property">
                                <span className="md-name">File name</span>
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
