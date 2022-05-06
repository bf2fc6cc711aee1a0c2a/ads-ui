import React, {FunctionComponent} from "react";
import {Draft} from "@app/models";
import {DraftListItem} from "@app/pages/components/home/draft-list-item";
import "./draft-list.css";

export type DraftListProps = {
    drafts: Draft[];
}

export const DraftList: FunctionComponent<DraftListProps> = ({drafts}: DraftListProps) => {
    return (
        <div className="draft-list">
            {
                drafts.map(draft => (
                    <DraftListItem draft={draft} />
                ))
            }
        </div>
    );
};
