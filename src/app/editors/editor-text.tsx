import React from "react";
import {Editor as DraftEditor, EditorProps} from "@app/editors/editor-types";
import Editor from "@monaco-editor/react";

/**
 * Simple text editor.  This is a fallback editor for any text based content
 * we might want to edit.
 */
export const TextEditor: DraftEditor = ({content, onChange}: EditorProps) => {
    let defaultValue: string = "";
    if (typeof content.data === "string") {
        defaultValue = content.data as string;
    } else {
        defaultValue = JSON.stringify(content.data as string, null, 4);
    }
    return (
        <Editor
            className="text-editor"
            defaultLanguage="json"
            defaultValue={defaultValue}
            onChange={onChange}
            height="100%"
            options={{
                automaticLayout: true
            }}
        />
    );
};
