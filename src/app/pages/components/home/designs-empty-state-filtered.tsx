import React, {FunctionComponent} from "react";
import {EmptyState, EmptyStateBody, EmptyStateIcon, Title} from "@patternfly/react-core";
import {AddCircleOIcon} from "@patternfly/react-icons";

/**
 * Properties
 */
export type DesignsEmptyStateFilteredProps = {
};

/**
 * The empty state UI shown to the user when no designs are available, either due to
 * filtering or because no designs have been created yet.
 */
export const DesignsEmptyStateFiltered: FunctionComponent<DesignsEmptyStateFilteredProps> = ({}: DesignsEmptyStateFilteredProps) => {
    return (
        <EmptyState>
            <EmptyStateIcon icon={AddCircleOIcon} />
            <Title headingLevel="h4" size="lg">
                No matching designs
            </Title>
            <EmptyStateBody>
                No designs matched your filter criteria.  Trying changing your criteria and
                searching again.
            </EmptyStateBody>
        </EmptyState>
    );
};
