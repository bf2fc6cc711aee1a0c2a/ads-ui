import React, {FunctionComponent} from "react";
import {Button, EmptyState, EmptyStateBody, EmptyStateIcon, EmptyStateVariant, Title} from "@patternfly/react-core";
import {CubesIcon} from "@patternfly/react-icons";

export type RegistryPageProps = {
};

export const RegistryPage: FunctionComponent<RegistryPageProps> = ({}: RegistryPageProps) => {
    return (
        <EmptyState variant={EmptyStateVariant.xl}>
            <EmptyStateIcon icon={CubesIcon} />
            <Title headingLevel="h5" size="4xl">
                API Designer - Registry Page
            </Title>
            <EmptyStateBody>
                This page will show a list of artifacts in the registry.
            </EmptyStateBody>
            <Button variant="primary">Primary action</Button>
        </EmptyState>
    );
}
