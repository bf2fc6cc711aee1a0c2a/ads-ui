import React, {FunctionComponent, useEffect, useState} from "react";
import "./editor.css";
import {PageSection, PageSectionVariants} from "@patternfly/react-core";
import {DesignsService, useDesignsService} from "@app/services";
import {ArtifactTypes, Design, DesignContent} from "@app/models";
import {IsLoading} from "@app/components";
import {EditorContext} from "@app/pages/components";
import {OpenApiEditor, ProtoEditor, TextEditor} from "@app/editors";
import {Navigation, useNavigation} from "@app/contexts/navigation";
import {AsyncApiEditor} from "@app/editors/editor-asyncapi";


export type EditorPageProps = {
    params: any;
};


export const EditorPage: FunctionComponent<EditorPageProps> = ({params}: EditorPageProps) => {
    const [isLoading, setLoading] = useState(true);
    const [design, setDesign] = useState<Design>();
    const [designContent, setDesignContent] = useState<DesignContent>();
    const [currentContent, setCurrentContent] = useState<any>();
    const [isDirty, setDirty] = useState(false);

    const designsService: DesignsService = useDesignsService();

    const nav: Navigation = useNavigation();

    // Load the design based on the design ID (from the path param).
    useEffect(() => {
        setLoading(true);
        const designId: string = params["designId"];

        designsService.getDesign(designId).then(design => {
            setDesign(design);
        }).catch(error => {
            // TODO handle error
            console.error(`[EditorPage] Failed to get design with id ${designId}: `, error);
        })
    }, [params]);

    // Load the design content
    useEffect(() => {
        const designId: string = params["designId"];
        designsService.getDesignContent(designId).then(content => {
            setDesignContent(content);
            setLoading(false);
            setDirty(false);
            setCurrentContent(content.data);
        }).catch(error => {
            // TODO handle error
            console.error(`[EditorPage] Failed to get design content with id ${designId}: `, error);
        });
    }, [design])

    // Called when the user makes an edit in the editor.
    const onEditorChange = (value: any): void => {
        setCurrentContent(value);
        setDirty(true);
    }

    // Called when the user makes an edit in the editor.
    const onSave = (): void => {
        designsService.updateDesignContent({
            ...designContent as DesignContent,
            data: currentContent
        }).then(() => {
            setDesign({
                ...design,
                modifiedOn: new Date()
            } as Design);
        }).catch(error => {
            // TODO handle error
            console.error("[EditorPage] Failed to save design content: ", error);
        });
    };

    // Called when the user makes an edit in the editor.
    const onCancel = (): void => {
        nav.navigateTo("/");
    };

    const textEditor: React.ReactElement = (
        <TextEditor content={designContent as DesignContent} onChange={onEditorChange} />
    );

    const protoEditor: React.ReactElement = (
        <ProtoEditor content={designContent as DesignContent} onChange={onEditorChange} />
    );

    const openapiEditor: React.ReactElement = (
        <OpenApiEditor content={designContent as DesignContent} onChange={onEditorChange} />
    );

    const asyncapiEditor: React.ReactElement = (
        <AsyncApiEditor content={designContent as DesignContent} onChange={onEditorChange} />
    );

    const editor = (): React.ReactElement => {
        if (design?.type === ArtifactTypes.OPENAPI) {
            return openapiEditor;
        } else if (design?.type === ArtifactTypes.ASYNCAPI) {
            return asyncapiEditor;
        } else if (design?.type === ArtifactTypes.PROTOBUF) {
            return protoEditor;
        }

        // TODO create different text editors depending on the content type?  Or assume
        // that the text editor can configure itself appropriately?
        return textEditor;
    };

    return (
        <IsLoading condition={isLoading}>
            <PageSection variant={PageSectionVariants.light} id="section-context">
                <EditorContext design={design as Design} dirty={isDirty} onSave={onSave} onCancel={onCancel} />
            </PageSection>
            <PageSection variant={PageSectionVariants.light} id="section-editor">
                <div className="editor-parent">
                    {editor()}
                </div>
            </PageSection>
        </IsLoading>
    );
}
