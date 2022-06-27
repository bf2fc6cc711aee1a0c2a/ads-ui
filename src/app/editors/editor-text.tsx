import React, {MutableRefObject, useEffect, useRef, useState} from "react";
import {Editor as DesignEditor, EditorProps} from "@app/editors/editor-types";
import Editor from "@monaco-editor/react";
import {ContentTypes, DesignContent} from "@app/models";
import {editor} from "monaco-editor";
import IStandaloneCodeEditor = editor.IStandaloneCodeEditor;


export const contentToString = (content: DesignContent): string => {
    let value: string = "";
    if (typeof content.data === "string") {
        value = content.data as string;
    } else {
        value = JSON.stringify(content.data as string, null, 4);
    }
    return value;
}


export const contentToLanguage = (content: DesignContent): string => {
    if (content.contentType === ContentTypes.APPLICATION_YAML) {
        return "yaml";
    } else if (content.contentType === ContentTypes.APPLICATION_XML) {
        return "xml";
    } else if (content.contentType === ContentTypes.TEXT_XML) {
        return "xml";
    } else if (content.contentType === ContentTypes.APPLICATION_WSDL) {
        return "xml";
    }
    return "json";
};


/**
 * Simple text editor.  This is a fallback editor for any text based content
 * we might want to edit.
 */
export const TextEditor: DesignEditor = ({content, onChange}: EditorProps) => {
    const defaultValue: string = contentToString(content);
    const defaultLanguage: string = contentToLanguage(content);

    const [value, setValue] = useState<string>(defaultValue);
    const [language, setLanguage] = useState<string>(defaultLanguage);

    const editorRef: MutableRefObject<IStandaloneCodeEditor|undefined> = useRef<IStandaloneCodeEditor>();

    useEffect(() => {
        const contentString: string = contentToString(content);
        const lang: string = contentToLanguage(content);

        setValue(contentString);
        setLanguage(lang);

        if (editorRef.current) {
            editorRef.current?.setValue(contentString);
        }
    }, [content]);

    return (
        <Editor
            className="text-editor"
            language={language}
            value={value}
            onChange={onChange}
            options={{
                automaticLayout: true,
                wordWrap: 'on'
            }}
            onMount={(editor, monaco) => {
                editorRef.current = editor;
            }}
        />
    );
};
