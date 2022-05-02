import React, {FunctionComponent} from "react";
import {Grid, GridItem, PageSection, PageSectionVariants, Text, TextContent} from "@patternfly/react-core";
import {RhosrPanel} from "@app/pages/components";
import {DraftsPanel} from "@app/pages/components/home/drafts-panel";
import {FilePanel} from "@app/pages/components/home/file-panel";

export type HomePageProps = {
};

export const HomePage: FunctionComponent<HomePageProps> = ({}: HomePageProps) => {

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
                        <DraftsPanel />
                    </GridItem>

                    <GridItem span={4}>
                        <RhosrPanel />
                    </GridItem>

                    <GridItem span={5}>
                        <FilePanel />
                    </GridItem>
                </Grid>
            </PageSection>
        </React.Fragment>
    );
}
