import React, {FunctionComponent} from "react";
import {EmptyState, EmptyStateBody, EmptyStateIcon, Title} from "@patternfly/react-core";
import {AddCircleOIcon} from "@patternfly/react-icons";

/**
 * Properties
 */
export type DraftsEmptyStateFilteredProps = {
};

/**
 * The empty state UI shown to the user when no drafts are available, either due to
 * filtering or because no drafts have been created yet.
 */
export const DraftsEmptyStateFiltered: FunctionComponent<DraftsEmptyStateFilteredProps> = ({}: DraftsEmptyStateFilteredProps) => {
    return (
        <EmptyState>
            <EmptyStateIcon icon={AddCircleOIcon} />
            <Title headingLevel="h4" size="lg">
                No matching drafts
            </Title>
            <EmptyStateBody>
                No drafts matched your filter criteria.  Trying changing your criteria and
                searching again.
            </EmptyStateBody>
        </EmptyState>
    );
};
