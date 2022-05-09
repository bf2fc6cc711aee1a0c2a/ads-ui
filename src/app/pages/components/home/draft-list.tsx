import React, {FunctionComponent} from "react";
import {Draft} from "@app/models";
import {DraftListItem} from "@app/pages/components/home/draft-list-item";
import "./draft-list.css";

export type DraftListProps = {
    drafts: Draft[];
    onEdit: (draft: Draft) => void;
    onDelete: (draft: Draft) => void;
}

export const DraftList: FunctionComponent<DraftListProps> = ({drafts, onEdit, onDelete}: DraftListProps) => {
    return (
        <div className="draft-list">
            {
                drafts.map(draft => (
                    <DraftListItem key={draft.id} draft={draft} onEdit={() => onEdit(draft)} onDelete={() => onDelete(draft)} />
                ))
            }
        </div>
    );
};
