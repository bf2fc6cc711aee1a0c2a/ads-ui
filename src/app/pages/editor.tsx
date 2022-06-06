import React, {FunctionComponent, useEffect, useState} from "react";
import "./editor.css";
import {PageSection, PageSectionVariants} from "@patternfly/react-core";
import {DraftsService, useDraftsService} from "@app/services";
import {Draft, DraftContent} from "@app/models";
import {IsLoading} from "@app/components";
import {EditorContext} from "@app/pages/components";
import {OpenApiEditor, ProtoEditor, TextEditor} from "@app/editors";
import {Navigation, useNavigation} from "@app/contexts/navigation";


export type EditorPageProps = {
    params: any;
};


export const EditorPage: FunctionComponent<EditorPageProps> = ({params}: EditorPageProps) => {
    const [isLoading, setLoading] = useState(true);
    const [draft, setDraft] = useState<Draft>();
    const [draftContent, setDraftContent] = useState<DraftContent>();
    const [currentContent, setCurrentContent] = useState<any>();
    const [isDirty, setDirty] = useState(false);

    const draftsService: DraftsService = useDraftsService();

    const nav: Navigation = useNavigation();

    // Load the draft based on the draft ID (from the path param).
    useEffect(() => {
        setLoading(true);
        const draftId: string = params["draftId"];

        draftsService.getDraft(draftId).then(draft => {
            setDraft(draft);
        }).catch(error => {
            // TODO handle error
            console.error(`[EditorPage] Failed to get draft with id ${draftId}: `, error);
        })
    }, [params]);

    // Load the draft content
    useEffect(() => {
        const draftId: string = params["draftId"];
        draftsService.getDraftContent(draftId).then(content => {
            setDraftContent(content);
            setLoading(false);
            setDirty(false);
            setCurrentContent(content.data);
        }).catch(error => {
            // TODO handle error
            console.error(`[EditorPage] Failed to get draft content with id ${draftId}: `, error);
        });
    }, [draft])

    // Called when the user makes an edit in the editor.
    const onEditorChange = (value: any): void => {
        setCurrentContent(value);
        setDirty(true);
    }

    // Called when the user makes an edit in the editor.
    const onSave = (): void => {
        draftsService.updateDraftContent({
            ...draftContent as DraftContent,
            data: currentContent
        }).then(() => {
            setDraft({
                ...draft,
                modifiedOn: new Date()
            } as Draft);
        }).catch(error => {
            // TODO handle error
            console.error("[EditorPage] Failed to save draft content: ", error);
        });
    };

    // Called when the user makes an edit in the editor.
    const onCancel = (): void => {
        nav.navigateTo("/");
    };

    const textEditor: React.ReactElement = (
        <TextEditor content={draftContent as DraftContent} onChange={onEditorChange} />
    );

    const protoEditor: React.ReactElement = (
        <ProtoEditor content={draftContent as DraftContent} onChange={onEditorChange} />
    );

    const openapiEditor: React.ReactElement = (
        <OpenApiEditor content={draftContent as DraftContent} onChange={onEditorChange} />
    );

    const editor = (): React.ReactElement => {
        if (draft?.type === "OPENAPI") {
            return openapiEditor;
        } else if (draft?.type === "PROTOBUF") {
            return protoEditor;
        }
        return textEditor;
    };

    return (
        <IsLoading condition={isLoading}>
            <PageSection variant={PageSectionVariants.light} id="section-context">
                <EditorContext draft={draft as Draft} dirty={isDirty} onSave={onSave} onCancel={onCancel} />
            </PageSection>
            <PageSection variant={PageSectionVariants.light} id="section-editor">
                <div className="editor-parent">
                    {editor()}
                </div>
            </PageSection>
        </IsLoading>
    );
}
