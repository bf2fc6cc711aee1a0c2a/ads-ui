import React, {FunctionComponent} from "react";
import "./design-list.css";
import {Design, DesignsSearchResults} from "@app/models";
import {TableComposable} from "@patternfly/react-table";

export type DesignListProps = {
    designs: DesignsSearchResults;
    onEdit: (design: Design) => void;
    onDelete: (design: Design) => void;
    onRegister: (design: Design) => void;
    onDownload: (design: Design) => void;
}

export const DesignList: FunctionComponent<DesignListProps> = ({designs, onEdit, onDelete, onRegister, onDownload}: DesignListProps) => {

    return (
        <div>It works when it's just a DIV, but comment this out and uncomment the TableComposable below to see the warning.</div>


        // <TableComposable />


        // IGNORE BELOW
        // NOTE: Following is an old list approach to showing the designs.  I'm migrating to a Table layout.
        // // <div className="design-list">
        //     {
        //         designs.designs.map(design => (
        //             <DesignListItem key={design.id} design={design}
        //                            onEdit={() => onEdit(design)}
        //                            onDownload={() => onDownload(design)}
        //                            onRegister={() => onRegister(design)}
        //                            onDelete={() => onDelete(design)} />
        //         ))
        //     }
        // </div>
    );
};
