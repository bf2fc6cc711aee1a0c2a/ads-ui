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

/**
 * Properties
 */
export type DraftsEmptyStateProps = {
    onCreate: () => void;
    onImport: () => void;
};

/**
 * The empty state UI shown to the user when no drafts are available, either due to
 * filtering or because no drafts have been created yet.
 */
export const DraftsEmptyState: FunctionComponent<DraftsEmptyStateProps> = ({onCreate, onImport}: DraftsEmptyStateProps) => {
    return (
        <EmptyState>
            <EmptyStateIcon icon={AddCircleOIcon} />
            <Title headingLevel="h4" size="lg">
                No drafts yet
            </Title>
            <EmptyStateBody>
                Create and edit API and schema designs with the API Designer.  To get started,
                create a new design or import one.
            </EmptyStateBody>
            <Button variant="primary" onClick={onCreate}>Create a schema or API design</Button>
        </EmptyState>
    );
};
