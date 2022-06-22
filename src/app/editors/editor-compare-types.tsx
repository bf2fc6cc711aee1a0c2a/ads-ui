import React from "react";
import {DesignContent} from "@app/models";

export type EditorCompareProps = {
    updatedContent: string;
    currentContent: DesignContent;
};

export type EditorCompare = React.FunctionComponent<EditorCompareProps>;