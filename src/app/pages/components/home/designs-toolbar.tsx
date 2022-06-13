import React, {FunctionComponent, useEffect, useState} from "react";
import "./designs-toolbar.css";
import {
    Button,
    OnPerPageSelect,
    OnSetPage,
    Pagination,
    SearchInput,
    Toolbar,
    ToolbarContent,
    ToolbarItem
} from "@patternfly/react-core";
import {SortAlphaDownAltIcon, SortAlphaDownIcon} from "@patternfly/react-icons";
import {DesignsSearchCriteria, DesignsSearchResults, Paging} from "@app/models";
import {ImportDropdown, ImportFrom} from "@app/pages/components";


/**
 * Properties
 */
export type DesignsToolbarProps = {
    criteria: DesignsSearchCriteria;
    paging: Paging;
    designs?: DesignsSearchResults;
    onCriteriaChange: (criteria: DesignsSearchCriteria) => void;
    onPagingChange: (paging: Paging) => void;
    onCreate: () => void;
    onImport: (from: ImportFrom) => void;
};


/**
 * The toolbar to filter (and paginate) the collection of designs.
 */
export const DesignsToolbar: FunctionComponent<DesignsToolbarProps> = (
    {criteria, paging, designs, onCriteriaChange, onPagingChange, onCreate, onImport}: DesignsToolbarProps) => {

    const [ filterValue, setFilterValue ] = useState(criteria.filterValue);

    useEffect(() => {
        setFilterValue(criteria.filterValue);
    }, [criteria]);

    const onSetPage: OnSetPage = (event: any, newPage: number, perPage?: number): void => {
        onPagingChange({
            ...paging,
            page: newPage,
            pageSize: perPage ? perPage : paging.pageSize
        });
    };

    const onPerPageSelect: OnPerPageSelect = (event: any, newPerPage: number): void => {
        onPagingChange({
            ...paging,
            pageSize: newPerPage
        });
    };

    const onFilterChange = (value: string): void => {
        setFilterValue(value);
    };

    const onSearch = (): void => {
        onCriteriaChange({
            ...criteria,
            filterValue
        })
    };

    const onClear = (): void => {
        setFilterValue("");
        onCriteriaChange({
            ...criteria,
            filterValue: ""
        })
    };

    const totalDesignCount = (): number => {
        return designs?.count || 0;
    };

    return (
        <Toolbar id="designs-toolbar" className="designs-toolbar">
            <ToolbarContent>
                <ToolbarItem variant="search-filter">
                    <SearchInput aria-label="Filter designs" value={filterValue} onChange={onFilterChange} onSearch={onSearch} onClear={onClear} />
                </ToolbarItem>
                <ToolbarItem>
                    <Button variant="primary" onClick={onCreate}>Create a schema or API design</Button>
                </ToolbarItem>
                <ToolbarItem>
                    <ImportDropdown variant="long" onImport={onImport} />
                </ToolbarItem>
                <ToolbarItem className="design-paging-item">
                    <Pagination
                        style={{padding: "0"}}
                        variant="bottom"
                        dropDirection="down"
                        isCompact={true}
                        itemCount={totalDesignCount()}
                        perPage={paging.pageSize}
                        page={paging.page}
                        onSetPage={onSetPage}
                        onPerPageSelect={onPerPageSelect}
                        widgetId="design-list-pagination"
                        className="design-list-pagination"
                    />
                </ToolbarItem>
            </ToolbarContent>
        </Toolbar>
    );
};
