import React, {FunctionComponent} from "react";
import {Draft} from "@app/models";
import {Flex, FlexItem} from "@patternfly/react-core";
import {NavLink} from "@app/components/navlink";
import {NewspaperIcon} from "@patternfly/react-icons";
import "./draft-list-item.css";

export type DraftListItemProps = {
    draft: Draft;
}

export const DraftListItem: FunctionComponent<DraftListItemProps> = ({draft}: DraftListItemProps) => {
    return (
        <Flex className="draft-item">
            <FlexItem><NewspaperIcon /></FlexItem>
            <FlexItem>
                <NavLink className="name" location={`/drafts/${draft.id}/editor`}>{draft.name}</NavLink>
                <div className="summary">{draft.summary}</div>
            </FlexItem>
        </Flex>
    );
};
