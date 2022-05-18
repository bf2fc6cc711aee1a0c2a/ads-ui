import React, {FunctionComponent} from "react";
import {Draft, DraftsSearchResults} from "@app/models";
import {DraftListItem} from "@app/pages/components/home/draft-list-item";
import "./draft-list.css";

export type DraftListProps = {
    drafts: DraftsSearchResults;
    onEdit: (draft: Draft) => void;
    onDelete: (draft: Draft) => void;
    onDownload: (draft: Draft) => void;
}

export const DraftList: FunctionComponent<DraftListProps> = ({drafts, onEdit, onDelete, onDownload}: DraftListProps) => {
    return (
        <div className="draft-list">
            {
                drafts.drafts.map(draft => (
                    <DraftListItem key={draft.id} draft={draft}
                                   onEdit={() => onEdit(draft)}
                                   onDownload={() => onDownload(draft)}
                                   onDelete={() => onDelete(draft)} />
                ))
            }
        </div>
    );
};
