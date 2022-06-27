import React from "react";
import {DesignContent} from "@app/models";
import {editor} from "monaco-editor";
import IDiffEditorConstructionOptions = editor.IDiffEditorConstructionOptions;

export type EditorCompareProps = {
    updatedContent: string;
    currentContent: DesignContent;
    contentOptions: IDiffEditorConstructionOptions;
};

export type EditorCompare = React.FunctionComponent<EditorCompareProps>;