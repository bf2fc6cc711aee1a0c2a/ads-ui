import React, {FunctionComponent, useEffect, useState} from "react";
import "./design-list.css";
import {Design, DesignsSearchResults, DesignsSort} from "@app/models";
import {ResponsiveTable} from "@rhoas/app-services-ui-components";
import {ArtifactTypeIcon, NavLink} from "@app/components";
import Moment from "react-moment";
import {hasContext} from "@app/utils";
import {Label} from "@patternfly/react-core";
import {IAction} from "@patternfly/react-table";
import {ThProps} from "@patternfly/react-table/src/components/TableComposable/Th";


export type DesignListProps = {
    designs: DesignsSearchResults;
    sort: DesignsSort;
    onSort: (sort: DesignsSort) => void;
    onEdit: (design: Design) => void;
    onDelete: (design: Design) => void;
    onRegister: (design: Design) => void;
    onDownload: (design: Design) => void;
    onSelect: (design: Design|undefined) => void;
}

export const DesignList: FunctionComponent<DesignListProps> = (
    {designs, sort, onSort, onEdit, onDelete, onRegister, onDownload, onSelect}: DesignListProps) => {

    const [selectedDesign, setSelectedDesign] = useState<Design>();
    const [sortByIndex, setSortByIndex] = useState<number>();

    const columns: any[] = [
        { index: 0, id: "name", label: "Name", width: 40, sortable: true },
        { index: 1, id: "type", label: "Type", width: 15, sortable: false },
        { index: 2, id: "modified-on", label: "Modified on", width: 15, sortable: true },
        { index: 3, id: "context", label: "Origin", width: 25, sortable: false },
    ];

    const labels = (design: Design): string[] => {
        const theLabels: string[] = [];
        if (hasContext(design, "file")) {
            theLabels.push("Local file");
        }
        if (hasContext(design, "rhosr")) {
            theLabels.push("Service registry");
        }
        if (hasContext(design, "url")) {
            theLabels.push("URL");
        }
        if (hasContext(design, "create")) {
            theLabels.push("New design");
        }
        return theLabels;
    };

    const renderColumnData = (column: Design, colIndex: number): React.ReactNode => {
        // Name.
        if (colIndex === 0) {
            return (
                <div>
                    <NavLink className="design-title" location={`/designs/${column.id}/editor`}>{column.name}</NavLink>
                    <div className="design-summary">{column.summary||"(A design without a description)"}</div>
                </div>
            );
        }
        // Type.
        if (colIndex === 1) {
            return <ArtifactTypeIcon type={column.type} isShowLabel={true} />
        }
        // Modified on.
        if (colIndex === 2) {
            return <Moment date={column.modifiedOn} fromNow={true} />
        }
        // Labels.
        if (colIndex === 3) {
            return labels(column).map(label => <Label color="blue">{label}</Label>);
        }
        return <span />
    };

    const actionsFor = (design: any): IAction[] => {
        return [
            { title: "Edit", onClick: () => onEdit(design) },
            { title: "Download", onClick: () => onDownload(design) },
            { title: "Register in Service Registry", onClick: () => onRegister(design) },
            { isSeparator: true, },
            { title: "Delete", onClick: () => onDelete(design) }
        ];
    }

    const sortParams = (column: any): ThProps["sort"] | undefined => {
        return column.sortable ? {
            sortBy: {
                index: sortByIndex,
                direction: sort.direction
            },
            onSort: (_event, index, direction) => {
                const sort: DesignsSort = {
                    by: index === 0 ? "name" : "modified-on",
                    direction
                };
                onSort(sort);
            },
            columnIndex: column.index
        } : undefined;
    };

    useEffect(() => {
        setSortByIndex(sort.by === "name" ? 0 : 2);
    }, [sort]);

    useEffect(() => {
        onSelect(selectedDesign);
    }, [selectedDesign]);

    useEffect(() => {
        setSelectedDesign(undefined);
    }, [designs]);

    return (
        <div className="design-list">
            <ResponsiveTable
                ariaLabel="list of designs"
                columns={columns}
                data={designs.designs}
                expectedLength={designs.count}
                onRowClick={(row) => setSelectedDesign(row.row)}
                renderHeader={({ column, Th, key }) => (
                    <Th sort={sortParams(column)}
                        className="design-list-header"
                        key={`header-${column.id}`}
                        width={column.width}
                        modifier="truncate">{column.label}</Th>
                )}
                renderCell={({ column, row, colIndex, Td, key }) => (
                    <Td className="design-list-cell" key={`cell-${colIndex}-${row.id}`} children={renderColumnData(row as Design, colIndex)} />
                )}
                renderActions={({row, ActionsColumn}) => (
                    <ActionsColumn key={`actions-${row['id']}`} items={actionsFor(row)}/>
                )}
                isRowSelected={({ row }) => row.id === selectedDesign?.id}
            />
        </div>
    );
};
