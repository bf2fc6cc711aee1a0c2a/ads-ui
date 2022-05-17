import React, {FunctionComponent, useEffect, useState} from "react";
import "./drafts-toolbar.css";
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
import {DraftsSearchCriteria, DraftsSearchResults, Paging} from "@app/models";


/**
 * Properties
 */
export type DraftsToolbarProps = {
    criteria: DraftsSearchCriteria;
    paging: Paging;
    drafts?: DraftsSearchResults;
    onCriteriaChange: (criteria: DraftsSearchCriteria) => void;
    onPagingChange: (paging: Paging) => void;
};


/**
 * The toolbar to filter (and paginate) the collection of drafts.
 */
export const DraftsToolbar: FunctionComponent<DraftsToolbarProps> = ({criteria, paging, drafts, onCriteriaChange, onPagingChange}: DraftsToolbarProps) => {
    const [ filterValue, setFilterValue ] = useState(criteria.filterValue);

    useEffect(() => {
        setFilterValue(criteria.filterValue);
    }, [criteria]);

    const onToggleAscending = (): void => {
        onCriteriaChange({
            ...criteria,
            ascending: !criteria.ascending
        });
    };

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

    const totalDraftCount = (): number => {
        return drafts?.count || 0;
    };

    return (
        <Toolbar id="drafts-toolbar" className="drafts-toolbar">
            <ToolbarContent>
                <ToolbarItem variant="search-filter">
                    <SearchInput aria-label="Filter drafts" value={filterValue} onChange={onFilterChange} onSearch={onSearch} onClear={onClear} />
                </ToolbarItem>
                <ToolbarItem className="sort-icon-item">
                    <Button variant="plain" aria-label="edit" data-testid="toolbar-btn-sort" onClick={onToggleAscending}>
                        {
                            criteria.ascending ? <SortAlphaDownIcon/> : <SortAlphaDownAltIcon/>
                        }
                    </Button>
                </ToolbarItem>
                <ToolbarItem className="draft-paging-item">
                    <Pagination
                        variant="bottom"
                        dropDirection="down"
                        itemCount={totalDraftCount()}
                        perPage={paging.pageSize}
                        page={paging.page}
                        onSetPage={onSetPage}
                        onPerPageSelect={onPerPageSelect}
                        widgetId="draft-list-pagination"
                        className="draft-list-pagination"
                    />
                </ToolbarItem>
            </ToolbarContent>
        </Toolbar>
    );
};
