import React, {FunctionComponent, useEffect, useState} from "react";
import "./drafts.panel.css";
import {Alert, Card, CardBody} from "@patternfly/react-core";
import {DownloadService, DraftsService, useDownloadService, useDraftsService} from "@app/services";
import {Draft, DraftsSearchCriteria, DraftsSearchResults, Paging} from "@app/models";
import {If, ListWithToolbar} from "@app/components";
import {
    DeleteDraftModal,
    DraftList,
    DraftsEmptyState,
    DraftsEmptyStateFiltered,
    DraftsToolbar, ExportToRhosrData, ExportToRhosrModal
} from "@app/pages/components";
import {Navigation, useNavigation} from "@app/contexts/navigation";
import {contentTypeForDraft, fileExtensionForDraft} from "@app/utils";


function convertToValidFilename(value: string): string {
    return (value.replace(/[\/|\\:*?"<>]/g, ""));
}

export type DraftsPanelProps = {
    onCreate: () => void;
    onImport: () => void;
}


export const DraftsPanel: FunctionComponent<DraftsPanelProps> = ({onCreate, onImport}: DraftsPanelProps) => {
    const [ isLoading, setLoading ] = useState(false);
    const [ refresh, setRefresh ] = useState(1);
    const [ isFiltered, setFiltered ] = useState(false);
    const [ paging, setPaging ] = useState<Paging>({
        pageSize: 20,
        page: 1
    });
    const [ criteria, setCriteria ] = useState<DraftsSearchCriteria>({
        filterValue: "",
        ascending: true,
        filterOn: "name"
    });
    const [ drafts, setDrafts ] = useState<DraftsSearchResults>();
    const [ draftToDelete, setDraftToDelete ] = useState<Draft>();
    const [ isDeleteModalOpen, setDeleteModalOpen ] = useState(false);
    const [ draftToRegister, setDraftToRegister ] = useState<Draft>();
    const [ isRegisterModalOpen, setRegisterModalOpen ] = useState(false);

    const draftsSvc: DraftsService = useDraftsService();
    const downloadSvc: DownloadService = useDownloadService();
    const nav: Navigation = useNavigation();

    const doRefresh = (): void => {
        setRefresh(refresh + 1);
    };

    const onEditDraft = (draft: Draft): void => {
        nav.navigateTo(`/drafts/${draft.id}/editor`);
    };

    const onDeleteDraft = (draft: Draft): void => {
        setDraftToDelete(draft);
        setDeleteModalOpen(true);
    };

    const onDeleteDraftConfirmed = (draft: Draft): void => {
        draftsSvc.deleteDraft(draft.id).then(() => {
            doRefresh();
        }).catch(error => {
            // TODO handle error
            console.error(error);
        });
        setDeleteModalOpen(false);
    };

    const onRegisterDraft = (draft: Draft): void => {
        setDraftToRegister(draft);
        setRegisterModalOpen(true);
    };

    const onRegisterDraftConfirmed = (event: ExportToRhosrData): void => {
        // TODO anything to do here other than close the modal?
        setRegisterModalOpen(false);
    };

    const onDownloadDraft = (draft: Draft): void => {
        draftsSvc.getDraftContent(draft.id).then(content => {
            const filename: string = `${convertToValidFilename(draft.name)}.${fileExtensionForDraft(draft, content)}`;
            const contentType: string = contentTypeForDraft(draft, content);
            const c: string = typeof content.data === "object" ? JSON.stringify(content.data, null, 4) : content.data as string;
            downloadSvc.downloadToFS(c, contentType, filename);
        });
    };

    const onCriteriaChange = (criteria: DraftsSearchCriteria): void =>  {
        setCriteria(criteria);
        setPaging({
            page: 1,
            pageSize: paging.pageSize
        });
        setFiltered(criteria.filterValue != undefined && criteria.filterValue.trim().length > 0);
        doRefresh();
    };

    const onPagingChange = (paging: Paging): void => {
        setPaging(paging);
        doRefresh();
    };

    useEffect(() => {
        setLoading(true);
        draftsSvc.searchDrafts(criteria, paging).then(drafts => {
            console.debug("[DraftsPanel] Drafts loaded: ", drafts);
            setDrafts(drafts);
            setLoading(false);
        }).catch(error => {
            // TODO need error handling
            console.error(error);
        });
    }, [refresh]);

    const emptyState: React.ReactNode = (
        <DraftsEmptyState onCreate={onCreate} onImport={onImport} />
    );

    const emptyStateFiltered: React.ReactNode = (
        <DraftsEmptyStateFiltered />
    );

    const toolbar: React.ReactNode = (
        <DraftsToolbar drafts={drafts} criteria={criteria} paging={paging}
                       onCriteriaChange={onCriteriaChange} onPagingChange={onPagingChange} />
    );

    return (
        <React.Fragment>
            <Card isSelectable={false}>
                <If condition={!drafts || (drafts.count === 0 && !isFiltered)}>
                    <Alert className="panel-alert" isInline variant="info" title="About your data" style={{ marginBottom: "15px"}}>
                        <p>
                            All designs are stored locally in your browser.  Clearing your browser cache or
                            switching to a new browser <em>might</em> result in loss of data.  Make sure you save your
                            work locally or in a Red Hat OpenShift Service Registry instance!  In the future your
                            designs will be saved to a persistent server, stay tuned!
                        </p>
                    </Alert>
                </If>
                <CardBody className="panel-body">
                    <ListWithToolbar toolbar={toolbar}
                                     emptyState={emptyState}
                                     filteredEmptyState={emptyStateFiltered}
                                     isLoading={isLoading}
                                     isFiltered={isFiltered}
                                     isEmpty={!drafts || drafts.count === 0}>
                        <DraftList drafts={drafts as DraftsSearchResults}
                                   onEdit={onEditDraft}
                                   onDownload={onDownloadDraft}
                                   onRegister={onRegisterDraft}
                                   onDelete={onDeleteDraft} />
                    </ListWithToolbar>
                </CardBody>
            </Card>
            <DeleteDraftModal draft={draftToDelete}
                              isOpen={isDeleteModalOpen}
                              onDelete={onDeleteDraftConfirmed}
                              onDownload={onDownloadDraft}
                              onCancel={() => setDeleteModalOpen(false)} />
            <ExportToRhosrModal draft={draftToRegister as Draft}
                                isOpen={isRegisterModalOpen}
                                onExported={onRegisterDraftConfirmed}
                                onCancel={() => setRegisterModalOpen(false)} />
        </React.Fragment>
    );
};
