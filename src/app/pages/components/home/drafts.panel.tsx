import React, {FunctionComponent, useEffect, useState} from "react";
import {
    Button,
    Card,
    CardBody,
    CardTitle,
    EmptyState,
    EmptyStateBody,
    EmptyStateVariant,
    Flex,
    FlexItem,
    Spinner,
    Title
} from "@patternfly/react-core";
import {DraftsService, useDraftsService} from "@app/services";
import {CreateDraft, Draft, CreateDraftContent, Template} from "@app/models";
import {If, IfNotEmpty, IsLoading} from "@app/components";
import {propertyReplace} from "@app/utils";
import "./drafts.panel.css";
import {CreateDraftModal, DraftList} from "@app/pages/components";


export type DraftsPanelProps = {
}


export const DraftsPanel: FunctionComponent<DraftsPanelProps> = ({}: DraftsPanelProps) => {
    const [ loading, setLoading ] = useState(false);
    const [ refresh, setRefresh ] = useState(1);
    const [ drafts, setDrafts ] = useState([] as (Draft[]));
    const [ isCreateModalOpen, setCreateModalOpen ] = useState(false);

    const draftsSvc: DraftsService = useDraftsService();

    const createDraft = async (info: CreateDraft, template: Template): Promise<void> => {
        let dc: CreateDraftContent = {
            contentType: template.content.contentType,
            data: template.content.data
        }
        if (typeof dc.data === "string") {
            dc.data = dc.data.replace("$NAME", info.name).replace("$SUMMARY", info.summary||"");
        } else {
            propertyReplace(dc.data, "$NAME", info.name);
            propertyReplace(dc.data, "$SUMMARY", info.summary||"");
        }
        draftsSvc.createDraft(info, template.content).then(() => {
            setCreateModalOpen(false);
            setRefresh(refresh + 1);
        }).catch(error => {
            // TODO handle error
            console.error(error);
        });
    };

    const editDraft = (draft: Draft): void => {
        console.debug("=====> User wants to edit the draft!");
    };

    const deleteDraft = (draft: Draft): void => {
        draftsSvc.deleteDraft(draft.id).then(() => {
            setRefresh(refresh + 1);
        }).catch(error => {
            // TODO handle error
            console.error(error);
        });
    };

    useEffect(() => {
        setLoading(true);
        draftsSvc.getDrafts().then(drafts => {
            console.debug("[DraftsPanel] Drafts loaded: ", drafts);
            setDrafts(drafts);
            setLoading(false);
        }).catch(error => {
            // TODO need error handling
            console.error(error);
        });
    }, [refresh]);

    return (
        <React.Fragment>
            <Card isSelectable={false}>
                <CardTitle className="panel-header">
                    <Flex>
                        <FlexItem className="title">Drafts</FlexItem>
                        <FlexItem className="actions" align={{ default: 'alignRight' }}>
                            <Button variant="primary" onClick={() => setCreateModalOpen(true)}>Create draft</Button>
                        </FlexItem>
                    </Flex>
                </CardTitle>
                <CardBody className="panel-body">
                    <IsLoading condition={loading}>
                        <IfNotEmpty collection={drafts} emptyStateTitle={`None found`}
                                    emptyStateMessage={`Click "Create draft" to get started on a new API or Schema.`}>
                            <DraftList drafts={drafts} onEdit={editDraft} onDelete={deleteDraft} />
                        </IfNotEmpty>
                    </IsLoading>
                </CardBody>
            </Card>
            <CreateDraftModal isOpen={isCreateModalOpen} onCreate={createDraft} onCancel={() => {setCreateModalOpen(false)}} />
        </React.Fragment>
    );
};
