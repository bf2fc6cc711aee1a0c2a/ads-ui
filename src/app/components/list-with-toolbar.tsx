import React, {FunctionComponent} from "react";
import {IsLoading} from "@app/components/is-loading";
import {If} from "@app/components/if";
import {IfNotEmpty} from "@app/components/if-not-empty";

/**
 * Properties
 */
export type ListWithToolbarProps = {
    toolbar: React.ReactNode;
    emptyState: React.ReactNode;
    filteredEmptyState: React.ReactNode;
    isLoading: boolean;
    isFiltered: boolean;
    isEmpty: boolean;
    children?: React.ReactNode;
};

/**
 * Wrapper around a set of arbitrary child elements and displays them only if the
 * indicated condition is true.
 */
export const ListWithToolbar: FunctionComponent<ListWithToolbarProps> = (
    {toolbar, emptyState, filteredEmptyState, isLoading, isEmpty, isFiltered, children}: ListWithToolbarProps) => {

    return (
        <React.Fragment>
            <If condition={!isEmpty || isFiltered} children={toolbar} />
            <IsLoading condition={isLoading}>
                <If condition={!isEmpty} children={children} />
                <If condition={isEmpty && isFiltered} children={filteredEmptyState} />
                <If condition={isEmpty && !isFiltered} children={emptyState} />
            </IsLoading>
        </React.Fragment>
    );
};
