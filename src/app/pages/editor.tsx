import React, {FunctionComponent} from "react";
import {Button, EmptyState, EmptyStateBody, EmptyStateIcon, EmptyStateVariant, Title} from "@patternfly/react-core";
import {CubesIcon} from "@patternfly/react-icons";

export type EditorPageProps = {
};

export const EditorPage: FunctionComponent<EditorPageProps> = ({}: EditorPageProps) => {
    return (
        <EmptyState variant={EmptyStateVariant.xl}>
            <EmptyStateIcon icon={CubesIcon} />
            <Title headingLevel="h5" size="4xl">
                API Designer - Editor Page
            </Title>
            <EmptyStateBody>
                This page will allow a user to edit an API or Schema.
            </EmptyStateBody>
            <Button variant="primary">Primary action</Button>
        </EmptyState>
    );
}
