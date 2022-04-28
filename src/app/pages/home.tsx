import React, {FunctionComponent, useState} from "react";
import {useHistory} from "react-router-dom";
import {
    PageSection, PageSectionVariants, Text, TextContent, Card, CardTitle, CardBody, EmptyState, Title,
    EmptyStateVariant, EmptyStateBody, Button, Grid, GridItem, FileUpload
} from "@patternfly/react-core";
import {Basename, useBasename} from "@rhoas/app-services-ui-shared";
import {Navigation, useNavigation} from "@app/contexts/navigation";

export type HomePageProps = {
};

export const HomePage: FunctionComponent<HomePageProps> = ({}: HomePageProps) => {

    const [ value, setValue ] = useState("");
    const [ filename, setFilename ] = useState("");

    const history = useHistory();
    const basename: Basename = useBasename();
    const nav: Navigation = useNavigation(basename, history);

    const onCreateDraft = (): void => {
        nav.navigateTo("/editor");
    };

    return (
        <React.Fragment>
            <PageSection variant={PageSectionVariants.light}>
                <TextContent>
                    <Text component="h1">API Designer</Text>
                    <Text component="p">A tool to design your APIs and Schemas.</Text>
                </TextContent>
            </PageSection>
            <PageSection variant={PageSectionVariants.default} isFilled={true}>
                <Grid hasGutter={true}>

                    {/*The Drafts card/section*/}
                    <GridItem span={3}>
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
                    </GridItem>


                    <GridItem span={4}>
                        {/*The Registries card/section*/}
                        <Card isSelectable={false}>
                            <CardTitle>Browse Service Registries</CardTitle>
                            <CardBody>
                                <EmptyState variant={EmptyStateVariant.xs}>
                                    <Title headingLevel="h4" size="md">
                                        None found
                                    </Title>
                                    <EmptyStateBody>
                                        Create a Service Registry instance to browse it for editable content.
                                    </EmptyStateBody>
                                    <Button variant="primary">Create registry</Button>
                                </EmptyState>
                            </CardBody>
                        </Card>
                    </GridItem>

                    <GridItem span={5}>
                        {/*The Open File/URL card/section*/}
                        <Card isSelectable={false}>
                            <CardTitle>Open a File/URL</CardTitle>
                            <CardBody>
                                <FileUpload
                                    id="text-file-with-edits-allowed"
                                    type="text"
                                    value={value}
                                    filename={filename}
                                    filenamePlaceholder="Drag and drop a file or upload one"
                                    isLoading={false}
                                    allowEditingUploadedText
                                    browseButtonText="Open"
                                />
                            </CardBody>
                        </Card>
                    </GridItem>
                </Grid>
            </PageSection>
        </React.Fragment>
    );
}
