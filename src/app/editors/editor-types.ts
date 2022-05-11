import React from "react";
import {DraftContent} from "@app/models";

export type EditorProps = {
    content: DraftContent;
    onChange: (value: any) => void;
};

export type Editor = React.FunctionComponent<EditorProps>;
