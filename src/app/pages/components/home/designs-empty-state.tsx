import React, {FunctionComponent} from "react";
import {
    Button,
    EmptyState,
    EmptyStateBody,
    EmptyStateIcon,
    EmptyStateSecondaryActions,
    Title
} from "@patternfly/react-core";
import {AddCircleOIcon} from "@patternfly/react-icons";
import {ImportDropdown, ImportFrom} from "@app/pages/components";

/**
 * Properties
 */
export type DesignsEmptyStateProps = {
    onCreate: () => void;
    onImport: (from: ImportFrom) => void;
};

/**
 * The empty state UI shown to the user when no designs are available, either due to
 * filtering or because no designs have been created yet.
 */
export const DesignsEmptyState: FunctionComponent<DesignsEmptyStateProps> = ({onCreate, onImport}: DesignsEmptyStateProps) => {
    return (
        <EmptyState>
            <EmptyStateIcon icon={AddCircleOIcon} />
            <Title headingLevel="h4" size="lg">
                No designs
            </Title>
            <EmptyStateBody>
                Create and edit schema and API designs with the API Designer.  To get started,
                create a new design or import one.
            </EmptyStateBody>
            <Button variant="primary" onClick={onCreate}>Create a schema or API design</Button>
            <EmptyStateSecondaryActions>
                <ImportDropdown  variant="long" onImport={onImport} />
            </EmptyStateSecondaryActions>
        </EmptyState>
    );
};
