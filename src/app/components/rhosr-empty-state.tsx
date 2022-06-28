import React, {FunctionComponent} from "react";
import {EmptyState, EmptyStateBody, EmptyStateIcon, Title} from "@patternfly/react-core";
import {AddCircleOIcon} from "@patternfly/react-icons";

/**
 * Properties
 */
export type RhosrEmptyStateProps = {
};

export const RhosrEmptyState: FunctionComponent<RhosrEmptyStateProps> = ({}: RhosrEmptyStateProps) => {
    return (
        <EmptyState>
            <EmptyStateIcon icon={AddCircleOIcon} />
            <Title headingLevel="h4" size="lg">
                No Service Registry instances
            </Title>
            <EmptyStateBody>
                To save a design as an artifact in Service Registry,
                you must create a Service Registry instance first.
            </EmptyStateBody>
            <a href="/application-services/service-registry">Create Service Registry instance</a>
        </EmptyState>
    );
};
