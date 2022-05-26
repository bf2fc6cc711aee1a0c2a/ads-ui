import React, {FunctionComponent, useState} from "react";
import {Dropdown, DropdownItem, DropdownSeparator, KebabToggle, MenuToggle} from "@patternfly/react-core";

/**
 * Properties
 */
export type ImportDropdownProps = {
    onImportFromFile: () => void;
    onImportFromUrl: () => void;
    onImportFromRhosr: () => void;
};

/**
 * A control to display the Import dropdown on the main page (used to select how to import content
 * into the API Designer).
 */
export const ImportDropdown: FunctionComponent<ImportDropdownProps> = ({onImportFromFile, onImportFromUrl, onImportFromRhosr}: ImportDropdownProps) => {
    const [isToggled, setToggled] = useState(false);

    const onToggle = (): void => {
        setToggled(!isToggled);
    };

    const menuToggle: React.ReactNode = (
        <MenuToggle variant="secondary" onClick={onToggle} isExpanded={isToggled}>Import a schema or API design</MenuToggle>
    );

    const onMenuSelect: (event?: React.SyntheticEvent<HTMLDivElement>) => void = (event) => {
        // @ts-ignore
        const action: string = event?.target.attributes["data-id"].value;
        setToggled(false);
        switch (action) {
            case "action-file":
                onImportFromFile();
                return;
            case "action-url":
                onImportFromUrl();
                return;
            case "action-rhosr":
                onImportFromRhosr();
                return;
        }
    };

    return (
        <Dropdown
            onSelect={onMenuSelect}
            toggle={menuToggle}
            isOpen={isToggled}
            isPlain
            dropdownItems={
                [
                    <DropdownItem key="action-file" data-id="action-file">Import from file</DropdownItem>,
                    <DropdownItem key="action-url" data-id="action-url">Import from URL</DropdownItem>,
                    <DropdownItem key="action-rhosr" data-id="action-rhosr">Import from Service Registry</DropdownItem>,
                ]
            }
            position="right"
        />
    );
};
