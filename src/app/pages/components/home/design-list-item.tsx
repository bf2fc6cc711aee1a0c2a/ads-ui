import React, {FunctionComponent, useState} from "react";
import {Design} from "@app/models";
import {
    ActionList,
    ActionListItem,
    Button,
    Dropdown,
    DropdownItem, DropdownSeparator,
    Flex,
    FlexItem,
    KebabToggle
} from "@patternfly/react-core";
import "./design-list-item.css";
import {ArtifactTypeIcon} from "@app/components/artifact-type-icon";

export type DesignListItemProps = {
    design: Design;
    onEdit: () => void;
    onDelete: () => void;
    onDownload: () => void;
    onRegister: () => void;
}

export const DesignListItem: FunctionComponent<DesignListItemProps> = (
    {design, onEdit, onDelete, onDownload, onRegister}: DesignListItemProps) => {

    const [ isToggleOpen, setToggleOpen ] = useState(false);

    const onActionSelect: (event?: React.SyntheticEvent<HTMLDivElement>) => void = (event) => {
        // @ts-ignore
        const action: string = event?.target.attributes["data-id"].value;
        setToggleOpen(false);
        switch (action) {
            case "action-edit":
                onEdit();
                return;
            case "action-delete":
                onDelete();
                return;
            case "action-download":
                onDownload();
                return;
            case "action-register":
                onRegister();
                return;
        }
    };

    return (
        <div className="design-item">
            <div className="design-item-icon">
                <ArtifactTypeIcon type={design.type} />
            </div>
            <div className="design-item-info">
                <div className="name">{design.name}</div>
                <div className="summary">{design.summary||"(Design or schema with no summary)"}</div>
            </div>
            <div className="design-item-actions">
                <ActionList>
                    <ActionListItem>
                        <Button variant="secondary" onClick={onEdit}>Edit</Button>
                    </ActionListItem>
                    <ActionListItem>
                        <Dropdown
                            onSelect={onActionSelect}
                            toggle={<KebabToggle onToggle={setToggleOpen} />}
                            isOpen={isToggleOpen}
                            isPlain
                            dropdownItems={
                                [
                                    <DropdownItem key="action-edit" data-id="action-edit">Edit</DropdownItem>,
                                    <DropdownItem key="action-download" data-id="action-download">Download</DropdownItem>,
                                    <DropdownItem key="action-register" data-id="action-register">Export to Service Registry</DropdownItem>,
                                    <DropdownSeparator key="action-sep-1" />,
                                    <DropdownItem key="action-delete" data-id="action-delete">Delete</DropdownItem>,
                                ]
                            }
                            position="right"
                        />
                    </ActionListItem>
                </ActionList>
            </div>
        </div>
    );
};
