import React, {FunctionComponent} from "react";
import {Template} from "@app/models";
import "./template-item.css";
import {PlusCircleIcon} from "@patternfly/react-icons";

export type TemplateItemProps = {
    template: Template;
    isSelected: boolean;
    onSelect: (template: Template) => void;
}

export const TemplateItem: FunctionComponent<TemplateItemProps> = ({template, isSelected, onSelect}: TemplateItemProps) => {
    const onClick = (): void => {
        if (!isSelected) {
            onSelect(template);
        }
    };

    return (
        <div className={`template-item ${isSelected ? "selected" : "not-selected"}`} onClick={onClick}>
            <div className="icon">
                <PlusCircleIcon />
            </div>
            <div className="name">{template.name}</div>
        </div>
    );
};
