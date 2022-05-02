import React, {FunctionComponent, useState} from "react";
import {
    Button,
    Card,
    CardBody,
    CardTitle,
    EmptyState,
    EmptyStateBody,
    EmptyStateVariant,
    Title
} from "@patternfly/react-core";
import {Navigation, useNavigation} from "@app/contexts/navigation";

export type DraftsPanelProps = {
}

export const DraftsPanel: FunctionComponent<DraftsPanelProps> = ({}: DraftsPanelProps) => {
    const [ loading, setLoading ] = useState(false);

    const nav: Navigation = useNavigation();

    const onCreateDraft = (): void => {
        nav.navigateTo("/editor");
    };

    return (
        <Card isSelectable={false}>
            <CardTitle>Drafts</CardTitle>
            <CardBody>
                <EmptyState variant={EmptyStateVariant.xs}>
                    <Title headingLevel="h4" size="md">
                        None found
                    </Title>
                    <EmptyStateBody>
                        Click "Create draft" below to get started on a new
                        API or Schema.
                    </EmptyStateBody>
                    <div style={{marginTop: "20px"}}>
                        <Button variant="primary" onClick={onCreateDraft}>Create draft</Button>
                    </div>
                </EmptyState>
            </CardBody>
        </Card>
    );
};
