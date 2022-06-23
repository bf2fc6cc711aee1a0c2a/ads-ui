import React, {FunctionComponent, useEffect, useState} from "react";
import "./designs.panel.css";
import {Alert, Card, CardBody} from "@patternfly/react-core";
import {DesignsService, DownloadService, useDesignsService, useDownloadService} from "@app/services";
import {Design, DesignsSearchCriteria, DesignsSearchResults, DesignsSort, Paging} from "@app/models";
import {ListWithToolbar} from "@app/components";
import {
    DeleteDesignModal,
    DesignList,
    DesignsEmptyState,
    DesignsEmptyStateFiltered,
    DesignsToolbar,
    ExportToRhosrData,
    ExportToRhosrModal,
    ImportFrom,
    RenameData,
    RenameModal
} from "@app/pages/components";
import {Navigation, useNavigation} from "@app/contexts/navigation";
import {contentTypeForDesign, fileExtensionForDesign} from "@app/utils";
import {AlertVariant, useAlert} from "@rhoas/app-services-ui-shared";


function convertToValidFilename(value: string): string {
    return (value.replace(/[\/|\\:*?"<>]/g, ""));
}

export type DesignsPanelProps = {
    selectedDesign: Design | undefined;
    onDesignSelected: (design: Design | undefined) => void;
    onCreate: () => void;
    onImport: (from: ImportFrom) => void;
}


export const DesignsPanel: FunctionComponent<DesignsPanelProps> = ({selectedDesign, onDesignSelected, onCreate, onImport}: DesignsPanelProps) => {
    const [ isLoading, setLoading ] = useState(false);
    const [ refresh, setRefresh ] = useState(1);
    const [ isFiltered, setFiltered ] = useState(false);
    const [ paging, setPaging ] = useState<Paging>({
        pageSize: 20,
        page: 1
    });
    const [ criteria, setCriteria ] = useState<DesignsSearchCriteria>({
        filterValue: "",
        filterOn: "name"
    });
    const [ sort, setSort ] = useState<DesignsSort>({
        by: "name",
        direction: "asc"
    });
    const [ designs, setDesigns ] = useState<DesignsSearchResults>();
    const [ designToDelete, setDesignToDelete ] = useState<Design>();
    const [ isDeleteModalOpen, setDeleteModalOpen ] = useState(false);
    const [ designToRegister, setDesignToRegister ] = useState<Design>();
    const [ isRegisterModalOpen, setRegisterModalOpen ] = useState(false);
    const [ designToRename, setDesignToRename ] = useState<Design>();
    const [ isRenameModalOpen, setRenameModalOpen ] = useState(false);

    const designsSvc: DesignsService = useDesignsService();
    const downloadSvc: DownloadService = useDownloadService();
    const nav: Navigation = useNavigation();
    const { addAlert } = useAlert() || {};

    const doRefresh = (): void => {
        setRefresh(refresh + 1);
    };

    const onEditDesign = (design: Design): void => {
        nav.navigateTo(`/designs/${design.id}/editor`);
    };

    const onRenameDesign = (design: Design): void => {
        setDesignToRename(design);
        setRenameModalOpen(true);
    };

    const doRenameDesign = (event: RenameData): void => {
        designsSvc.renameDesign(designToRename?.id as string, event.name, event.summary).then(() => {
            if (designToRename) {
                designToRename.name = event.name;
                designToRename.summary = event.summary;
            }
            setRenameModalOpen(false);
            addAlert({
                title: `Design '${event.name}' successfully renamed.`,
                variant: AlertVariant.success,
                dataTestId: "toast-design-renamed"
            });
        }).catch(e => {
            // TODO error handling
        })
    };

    const onDeleteDesign = (design: Design): void => {
        setDesignToDelete(design);
        setDeleteModalOpen(true);
    };

    const onDeleteDesignConfirmed = (design: Design): void => {
        designsSvc.deleteDesign(design.id).then(() => {
            doRefresh();
            addAlert({
                title: `Design '${design.name}' successfully deleted.`,
                variant: AlertVariant.success,
                dataTestId: "toast-design-deleted"
            });
        }).catch(error => {
            console.error(error);
            addAlert({
                title: `Failed to delete design '${design.name}'.`,
                variant: AlertVariant.danger,
                dataTestId: "toast-design-delete-error"
            });
        });
        setDeleteModalOpen(false);
    };

    const onRegisterDesign = (design: Design): void => {
        setDesignToRegister(design);
        setRegisterModalOpen(true);
    };

    const onRegisterDesignConfirmed = (event: ExportToRhosrData): void => {
        setRegisterModalOpen(false);
        addAlert({
            title: `Design '${event.design.name}' successfully registered in Service Registry.`,
            variant: AlertVariant.success,
            dataTestId: "toast-design-registered"
        });
    };

    const onDownloadDesign = (design: Design): void => {
        designsSvc.getDesignContent(design.id).then(content => {
            const filename: string = `${convertToValidFilename(design.name)}.${fileExtensionForDesign(design, content)}`;
            const contentType: string = contentTypeForDesign(design, content);
            const theContent: string = typeof content.data === "object" ? JSON.stringify(content.data, null, 4) : content.data as string;
            downloadSvc.downloadToFS(design, theContent, contentType, filename);
        });
    };

    const onCriteriaChange = (criteria: DesignsSearchCriteria): void =>  {
        setCriteria(criteria);
        setPaging({
            page: 1,
            pageSize: paging.pageSize
        });
        setFiltered(criteria.filterValue != undefined && criteria.filterValue.trim().length > 0);
        doRefresh();
    };

    const onSortDesigns = (sort: DesignsSort): void => {
        setSort(sort);
        doRefresh();
    };

    const onPagingChange = (paging: Paging): void => {
        setPaging(paging);
        doRefresh();
    };

    useEffect(() => {
        setLoading(true);
        onDesignSelected(undefined);
        designsSvc.searchDesigns(criteria, paging, sort).then(designs => {
            console.debug("[DesignsPanel] Designs loaded: ", designs);
            setDesigns(designs);
            setLoading(false);
        }).catch(error => {
            // TODO need error handling
            console.error(error);
        });
    }, [refresh]);

    const emptyState: React.ReactNode = (
        <DesignsEmptyState onCreate={onCreate} onImport={onImport} />
    );

    const emptyStateFiltered: React.ReactNode = (
        <DesignsEmptyStateFiltered />
    );

    const toolbar: React.ReactNode = (
        <DesignsToolbar designs={designs} criteria={criteria} paging={paging}
                        onCreate={onCreate} onImport={onImport}
                        onCriteriaChange={onCriteriaChange} onPagingChange={onPagingChange} />
    );

    return (
        <React.Fragment>
            <Card isSelectable={false}>
                <CardBody className="panel-body">
                    <ListWithToolbar toolbar={toolbar}
                                     emptyState={emptyState}
                                     filteredEmptyState={emptyStateFiltered}
                                     isLoading={isLoading}
                                     isFiltered={isFiltered}
                                     isEmpty={!designs || designs.count === 0}>
                        <Alert className="panel-alert" isInline variant="info" title="About your data" style={{ marginBottom: "15px"}}>
                            <p>
                                All designs are stored locally in your browser.  Clearing your browser cache or
                                switching to a new browser <em>might</em> result in loss of data.  Make sure you save your
                                work locally or in a Red Hat OpenShift Service Registry instance!  In the future your
                                designs will be saved to a persistent server, stay tuned!
                            </p>
                        </Alert>
                        <DesignList designs={designs as DesignsSearchResults}
                                    selectedDesign={selectedDesign}
                                    sort={sort}
                                    onSelect={onDesignSelected}
                                    onSort={onSortDesigns}
                                    onEdit={onEditDesign}
                                    onRename={onRenameDesign}
                                    onDownload={onDownloadDesign}
                                    onRegister={onRegisterDesign}
                                    onDelete={onDeleteDesign} />
                    </ListWithToolbar>
                </CardBody>
            </Card>
            <DeleteDesignModal design={designToDelete}
                              isOpen={isDeleteModalOpen}
                              onDelete={onDeleteDesignConfirmed}
                              onDownload={onDownloadDesign}
                              onCancel={() => setDeleteModalOpen(false)} />
            <ExportToRhosrModal design={designToRegister as Design}
                                isOpen={isRegisterModalOpen}
                                onExported={onRegisterDesignConfirmed}
                                onCancel={() => setRegisterModalOpen(false)} />
            <RenameModal design={designToRename}
                         isOpen={isRenameModalOpen}
                         onRename={doRenameDesign}
                         onCancel={() => setRenameModalOpen(false)} />
        </React.Fragment>
    );
};
