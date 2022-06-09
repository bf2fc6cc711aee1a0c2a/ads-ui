import React, {FunctionComponent} from "react";
import "./design-list.css";
import {Design, DesignsSearchResults} from "@app/models";
import {DesignListItem} from "@app/pages/components/home/design-list-item";

export type DesignListProps = {
    designs: DesignsSearchResults;
    onEdit: (design: Design) => void;
    onDelete: (design: Design) => void;
    onRegister: (design: Design) => void;
    onDownload: (design: Design) => void;
}

export const DesignList: FunctionComponent<DesignListProps> = ({designs, onEdit, onDelete, onRegister, onDownload}: DesignListProps) => {
    return (
        <div className="design-list">
            {
                designs.designs.map(design => (
                    <DesignListItem key={design.id} design={design}
                                   onEdit={() => onEdit(design)}
                                   onDownload={() => onDownload(design)}
                                   onRegister={() => onRegister(design)}
                                   onDelete={() => onDelete(design)} />
                ))
            }
        </div>
    );
};
