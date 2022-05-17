import React, {RefObject, useEffect} from "react";
import {Editor as DraftEditor, EditorProps} from "@app/editors/editor-types";
import "./editor-openapi.css";
import {Config, useConfig} from "@rhoas/app-services-ui-shared";


export type OpenApiEditorProps = {
    className?: string;
} & EditorProps;


/**
 * OpenAPI editor.  The actual editor logic is written in Angular as a separate application
 * and loaded via an iframe.  This component is a bridge - it acts as a React component that
 * bridges to the iframe.
 */
export const OpenApiEditor: DraftEditor = ({content, onChange, className}: OpenApiEditorProps) => {
    const ref: RefObject<any> = React.createRef();
    const cfg: Config = useConfig();

    useEffect(() => {
        window.addEventListener("message", (event) => {
            if (event.data && event.data.type === "apicurio_onChange") {
                let newContent: any = event.data.data.content;
                if (typeof newContent === "object") {
                    newContent = JSON.stringify(newContent, null, 4);
                }
                onChange(newContent);
            }
        }, false);
    }, []);

    const editorAppUrl = (): string => {
        return cfg.ads.editorsBasePath;
    };

    const onEditorLoaded = (): void => {
        // Now it's OK to post a message to iframe with the content to edit.
        const value: string = typeof content.data === "object" ? JSON.stringify(content.data) : content.data as string;
        const message: any = {
            type: "apicurio-editingInfo",
            // tslint:disable-next-line:object-literal-sort-keys
            data: {
                content: {
                    format: "JSON",
                    type: "OPENAPI",
                    value: value
                },
                features: {
                    allowCustomValidations: false,
                    allowImports: false
                }
            }
        }
        ref.current.contentWindow.postMessage(message, "*");
    };

    return (
        <iframe id="openapi-editor-frame"
                ref={ ref }
                className={ className ? className : "editor-openapi-flex-container" }
                onLoad={ onEditorLoaded }
                src={ editorAppUrl() } />
    );
};
