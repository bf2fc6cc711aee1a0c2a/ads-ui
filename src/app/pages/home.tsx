import React, {FunctionComponent, useState} from "react";
import "./home.css";
import {
    ActionList, ActionListItem,
    Button, Dropdown, DropdownItem, DropdownSeparator,
    Grid,
    GridItem, KebabToggle,
    MenuToggle,
    PageSection,
    PageSectionVariants,
    Text,
    TextContent
} from "@patternfly/react-core";
import {CreateDraftModal, DraftsPanel, ImportDraftModal} from "@app/pages/components";
import {CreateDraft, CreateDraftContent, Template} from "@app/models";
import {propertyReplace} from "@app/utils";
import {DraftsService, useDraftsService} from "@app/services";
import {Navigation, useNavigation} from "@app/contexts/navigation";
import {ImportDropdown} from "@app/pages/components/home/import-dropdown";

export type HomePageProps = {
};

export const HomePage: FunctionComponent<HomePageProps> = ({}: HomePageProps) => {
    const [ isCreateModalOpen, setCreateModalOpen ] = useState(false);
    const [ isImportModalOpen, setImportModalOpen ] = useState(false);
    const [ importType, setImportType ] = useState<"FILE"|"URL">("FILE");

    const draftsSvc: DraftsService = useDraftsService();
    const nav: Navigation = useNavigation();

    const onImportFromFile = (): void => {
        setImportType("FILE");
        setImportModalOpen(true);
    };
    const onImportFromUrl = (): void => {
        setImportType("URL");
        setImportModalOpen(true);
    };
    const onImportFromRhosr = (): void => {
        // TODO: TBD
    };

    const createDraft = async (info: CreateDraft, template: Template): Promise<void> => {
        let dc: CreateDraftContent = {
            contentType: template.content.contentType,
            data: template.content.data
        }
        if (typeof dc.data === "string") {
            dc.data = dc.data.replace("$NAME", info.name).replace("$SUMMARY", info.summary||"");
        } else {
            propertyReplace(dc.data, "$NAME", info.name);
            propertyReplace(dc.data, "$SUMMARY", info.summary||"");
        }
        return draftsSvc.createDraft(info, template.content).then((draft) => {
            setCreateModalOpen(false);
            nav.navigateTo(`/drafts/${draft.id}/editor`);
        }).catch(error => {
            // TODO handle error
            console.error(error);
        });
    };

    const importDraft = async (event: CreateDraft, content: CreateDraftContent): Promise<void> => {
        return draftsSvc.createDraft(event, content).then((draft) => {
            setImportModalOpen(false);
            nav.navigateTo(`/drafts/${draft.id}/editor`);
        }).catch(error => {
            // TODO handle error
            console.error(error);
        });
    };

    return (
        <React.Fragment>
            <PageSection variant={PageSectionVariants.light} className="summary">
                <TextContent className="summary-title-and-description">
                    <Text component="h1" className="title">Red Hat OpenShift API Designer</Text>
                    <Text component="p" className="description">
                        A tool to design your APIs (OpenAPI, AsyncAPI) and schemas (Apache Avro, Google Protobuf, JSON Schema).
                        Manage your collection of API and schema designs below by creating, importing, and editing.
                    </Text>
                </TextContent>
                <Grid hasGutter={true}>
                    <GridItem span={11}>
                        <ActionList className="summary-actions">
                            <ActionListItem>
                                <Button className="btn-create" variant="primary" onClick={() => setCreateModalOpen(true)}>Create a schema or API design</Button>
                            </ActionListItem>
                            <ActionListItem>
                                <ImportDropdown onImportFromFile={onImportFromFile} onImportFromUrl={onImportFromUrl} onImportFromRhosr={onImportFromRhosr} />
                            </ActionListItem>
                        </ActionList>
                    </GridItem>
                </Grid>
                <CreateDraftModal isOpen={isCreateModalOpen} onCreate={createDraft} onCancel={() => {setCreateModalOpen(false)}} />
                <ImportDraftModal isOpen={isImportModalOpen} onImport={importDraft} onCancel={() => {setImportModalOpen(false)}}
                                  importType={importType} />
            </PageSection>
            <PageSection variant={PageSectionVariants.default} isFilled={true}>
                <Grid hasGutter={true}>
                    <GridItem span={11}>
                        <DraftsPanel onCreate={() => {setCreateModalOpen(true)}} onImport={() => {setImportModalOpen(true)}} />
                    </GridItem>
                </Grid>
            </PageSection>
        </React.Fragment>
    );
}
