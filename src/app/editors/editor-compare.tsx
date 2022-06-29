import React, {FunctionComponent} from "react";
import {DiffEditor} from "@monaco-editor/react";
import {editor} from "monaco-editor";
import IDiffEditorConstructionOptions = editor.IDiffEditorConstructionOptions;
import {contentToString} from "@app/utils";


export type EditorCompareProps = {
    before: any;
    after: any;
    contentOptions: IDiffEditorConstructionOptions;
};


/**
 * Compare text editor.  This is a compare editor for any text based content
 * we might want to edit.
 */
export const EditorCompare: FunctionComponent<EditorCompareProps> = ({before, after, contentOptions}: EditorCompareProps) => {
    const beforeValue: string = contentToString(before);
    const afterValue: string = contentToString(after);

    return (
        <DiffEditor
            className="text-editor"
            original={beforeValue}
            modified={afterValue}
            options={contentOptions}
        />
    );
};
