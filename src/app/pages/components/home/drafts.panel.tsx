import React, {FunctionComponent, useEffect, useState} from "react";
import {
    Button,
    Card,
    CardBody,
    CardTitle,
    EmptyState,
    EmptyStateBody,
    EmptyStateVariant, Flex, FlexItem, Spinner,
    Title
} from "@patternfly/react-core";
import {DraftsService, useDraftsService} from "@app/services";
import {Draft} from "@app/models";
import {If} from "@app/components";
import "./drafts.panel.css";
import {DraftList} from "@app/pages/components/home/draft-list";

export type DraftsPanelProps = {
}

export const DraftsPanel: FunctionComponent<DraftsPanelProps> = ({}: DraftsPanelProps) => {
    const [ loading, setLoading ] = useState(false);
    const [ drafts, setDrafts ] = useState([] as (Draft[]));

    const draftsSvc: DraftsService = useDraftsService();

    useEffect(() => {
        draftsSvc.getDrafts().then(drafts => {
            console.debug("[DraftsPanel] Drafts loaded: ", drafts);
            setDrafts(drafts);
            setLoading(false);
        }).catch(error => {
            // TODO need error handling
            console.error(error);
        });
    }, []);

    return (
        <Card isSelectable={false}>
            <CardTitle className="panel-header">
                <Flex>
                    <FlexItem className="title">Drafts</FlexItem>
                    <FlexItem className="actions" align={{ default: 'alignRight' }}>
                        <Button variant="primary">Create draft</Button>
                    </FlexItem>
                </Flex>
            </CardTitle>
            <CardBody className="panel-body">
                <If condition={loading}>
                    <Spinner />
                </If>
                <If condition={!loading}>
                    <If condition={drafts.length === 0}>
                        <EmptyState variant={EmptyStateVariant.xs}>
                            <Title headingLevel="h4" size="md">
                                None found
                            </Title>
                            <EmptyStateBody>
                                Click "Create draft" below to get started on a new
                                API or Schema.
                            </EmptyStateBody>
                            <div style={{marginTop: "20px"}}>
                                <Button variant="primary">Create draft</Button>
                            </div>
                        </EmptyState>
                    </If>
                    <If condition={drafts.length !== 0}>
                        <DraftList drafts={drafts} />
                    </If>
                </If>
            </CardBody>
        </Card>
    );
};
