import React from "react";
import {DiffEditor} from "@monaco-editor/react";
import {EditorCompare as DesignEditor, EditorCompareProps} from "@app/editors/editor-compare-types";

/**
 * Compare text editor.  This is a compare editor for any text based content
 * we might want to edit.
 */
export const EditorCompare: DesignEditor = ({updatedContent, currentContent}: EditorCompareProps) => {
    let currentContentDefaultValue: string = "";

    if (typeof currentContent.data === "string") {
        currentContentDefaultValue = currentContent.data as string;
    } else {
        currentContentDefaultValue = JSON.stringify(currentContent.data as string, null, 4);
    }

    return (
        <DiffEditor
            className="text-editor"
            original={currentContentDefaultValue}
            modified={updatedContent}
            options={{
                automaticLayout: true,
                wordWrap: 'on'
            }}
        />
    );
};