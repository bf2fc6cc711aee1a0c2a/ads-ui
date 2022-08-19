import React from "react";
import { DesignContent } from "@app/models";

export type EditorProps = {
    content: DesignContent;
    onChange: (value: any) => void;
};

export type Editor = React.FunctionComponent<EditorProps>;
