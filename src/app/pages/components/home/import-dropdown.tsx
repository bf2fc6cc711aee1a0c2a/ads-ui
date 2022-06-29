import React, {FunctionComponent, useState} from "react";
import "./import-dropdown.css";
import {Dropdown, DropdownItem, DropdownToggle} from "@patternfly/react-core";

export enum ImportFrom {
    FILE,
    URL,
    RHOSR
};

/**
 * Properties
 */
export type ImportDropdownProps = {
    variant: "long"|"short";
    onImport: (from: ImportFrom) => void;
};

/**
 * A control to display the Import dropdown on the main page (used to select how to import content
 * into the API Designer).
 */
export const ImportDropdown: FunctionComponent<ImportDropdownProps> = ({variant, onImport}: ImportDropdownProps) => {
    const [isToggled, setToggled] = useState(false);

    const onToggle = (value: boolean): void => {
        setToggled(value);
    };

    const toggle: React.ReactNode = (
        <DropdownToggle id="import-toggle" toggleVariant="secondary" onToggle={onToggle}>
            {variant === "short" ? "Import" : "Import design"}
        </DropdownToggle>
    );

    const onMenuSelect: (event?: React.SyntheticEvent<HTMLDivElement>) => void = (event) => {
        // @ts-ignore
        const action: string = event?.target.attributes["data-id"].value;
        setToggled(false);
        switch (action) {
            case "action-file":
                onImport(ImportFrom.FILE);
                return;
            case "action-url":
                onImport(ImportFrom.URL);
                return;
            case "action-rhosr":
                onImport(ImportFrom.RHOSR);
                return;
        }
    };

    return (
        <Dropdown
            onSelect={onMenuSelect}
            toggle={toggle}
            isOpen={isToggled}
            isPlain
            dropdownItems={
                [
                    <DropdownItem key="action-rhosr" data-id="action-rhosr">Import from Service Registry</DropdownItem>,
                    <DropdownItem key="action-url" data-id="action-url">Import from URL</DropdownItem>,
                    <DropdownItem key="action-file" data-id="action-file">Import from file</DropdownItem>,
                ]
            }
            position="right"
        />
    );
};
