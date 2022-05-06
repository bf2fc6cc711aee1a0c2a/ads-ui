import React, {FunctionComponent} from "react";
import {Grid, GridItem, PageSection, PageSectionVariants, Text, TextContent} from "@patternfly/react-core";
import {DraftsPanel, RhosrPanel} from "@app/pages/components";

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
                    <GridItem span={6}>
                        <DraftsPanel />
                    </GridItem>

                    <GridItem span={6}>
                        <RhosrPanel />
                    </GridItem>

                </Grid>
            </PageSection>
        </React.Fragment>
    );
}
