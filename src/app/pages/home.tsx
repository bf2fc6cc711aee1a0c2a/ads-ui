import React, {FunctionComponent} from "react";
import {Button, EmptyState, EmptyStateBody, EmptyStateIcon, EmptyStateVariant, Title} from "@patternfly/react-core";
import {CubesIcon} from "@patternfly/react-icons";

export type HomePageProps = {
};

const HomePage: FunctionComponent<HomePageProps> = ({}: HomePageProps) => {
    return (
        <EmptyState variant={EmptyStateVariant.xl}>
            <EmptyStateIcon icon={CubesIcon} />
            <Title headingLevel="h5" size="4xl">
                API Designer Home
            </Title>
            <EmptyStateBody>
                This is an empty state that represents the API Designer (phase 1) bootstrapped.  This feature
                is "coming soon".
            </EmptyStateBody>
            <Button variant="primary">Primary action</Button>
        </EmptyState>
    );
}

export default HomePage;
