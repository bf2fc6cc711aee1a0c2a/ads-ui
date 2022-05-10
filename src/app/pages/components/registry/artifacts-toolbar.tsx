import React, {FunctionComponent, useEffect, useState} from "react";
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
import {ArtifactsSearchResults, Paging} from "@app/models";
import "./artifacts-toolbar.css";


export interface ArtifactsToolbarCriteria {
    filterSelection: string;
    filterValue: string;
    ascending: boolean;
}

export type ArtifactsToolbarProps = {
    criteria: ArtifactsToolbarCriteria;
    paging: Paging;
    artifacts?: ArtifactsSearchResults;
    onCriteriaChange: (criteria: ArtifactsToolbarCriteria) => void;
    onPagingChange: (paging: Paging) => void;
}


export const ArtifactsToolbar: FunctionComponent<ArtifactsToolbarProps> = ({criteria, onCriteriaChange, paging, onPagingChange, artifacts}: ArtifactsToolbarProps) => {
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
        console.info("====> filter changed: ", value);
        setFilterValue(value);
    }

    const onSearch = (): void => {
        onCriteriaChange({
            ...criteria,
            filterValue
        })
    };

    const onClear = (): void => {
        console.info("====> CLEAR");
        setFilterValue("");
        onCriteriaChange({
            ...criteria,
            filterValue: ""
        })
    }

    const totalArtifactCount = (): number => {
        return artifacts?.count || 0;
    };

    return (
        <Toolbar id="artifacts-toolbar-1" className="artifacts-toolbar">
            <ToolbarContent>
                <ToolbarItem variant="search-filter">
                    <SearchInput aria-label="Filter artifacts" value={filterValue} onChange={onFilterChange} onSearch={onSearch} onClear={onClear} />
                </ToolbarItem>
                <ToolbarItem className="sort-icon-item">
                    <Button variant="plain" aria-label="edit" data-testid="toolbar-btn-sort" onClick={onToggleAscending}>
                        {
                            criteria.ascending ? <SortAlphaDownIcon/> : <SortAlphaDownAltIcon/>
                        }
                    </Button>
                </ToolbarItem>
                <ToolbarItem className="artifact-paging-item">
                    <Pagination
                        variant="bottom"
                        dropDirection="down"
                        itemCount={totalArtifactCount()}
                        perPage={paging.pageSize}
                        page={paging.page}
                        onSetPage={onSetPage}
                        onPerPageSelect={onPerPageSelect}
                        widgetId="artifact-list-pagination"
                        className="artifact-list-pagination"
                    />
                </ToolbarItem>
            </ToolbarContent>
        </Toolbar>
    );
};
