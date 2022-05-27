import React, {FunctionComponent, useEffect, useState} from "react";
import "./artifacts-toolbar.css";
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
import {Registry} from "@rhoas/registry-management-sdk";
import {ObjectSelect} from "@app/components/object-select";


export interface ArtifactsToolbarCriteria {
    filterSelection: string;
    filterValue: string;
    ascending: boolean;
}

export type ArtifactsToolbarProps = {
    registries: Registry[];
    criteria: ArtifactsToolbarCriteria;
    paging: Paging;
    artifacts?: ArtifactsSearchResults;
    onRegistrySelected: (registry: Registry) => void;
    onCriteriaChange: (criteria: ArtifactsToolbarCriteria) => void;
    onPagingChange: (paging: Paging) => void;
}


export const ArtifactsToolbar: FunctionComponent<ArtifactsToolbarProps> = ({registries, criteria, onCriteriaChange, paging,
                                                                            onPagingChange, artifacts, onRegistrySelected}: ArtifactsToolbarProps) => {
    const [ registry, setRegistry ] = useState<Registry>();
    const [ filterValue, setFilterValue ] = useState(criteria.filterValue);

    const onRegistrySelectInternal = (registry: Registry): void => {
        setRegistry(registry);
        onRegistrySelected(registry);
    };

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
    }

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
    }

    const totalArtifactCount = (): number => {
        return artifacts?.count || 0;
    };

    useEffect(() => {
        setFilterValue(criteria.filterValue);
    }, [criteria]);

    return (
        <Toolbar id="artifacts-toolbar-1" className="artifacts-toolbar">
            <ToolbarContent>
                <ToolbarItem variant="search-filter">
                    <ObjectSelect value={registry} items={registries} onSelect={onRegistrySelectInternal} itemToString={item => item.name} />
                </ToolbarItem>
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
