import React from "react";
import {FederatedProps} from "@app/contexts";
import {EditorPage, EditorPageProps} from "@app/pages/editor";

type FederatedEditorPageProps = EditorPageProps & FederatedProps;

const FederatedEditorPage: React.FunctionComponent<FederatedEditorPageProps> = () => {
    return (<EditorPage />);
}

export default FederatedEditorPage;
