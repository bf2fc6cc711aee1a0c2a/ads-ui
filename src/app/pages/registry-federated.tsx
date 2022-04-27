import React from "react";
import {FederatedProps} from "@app/contexts";
import {RegistryPage, RegistryPageProps} from "@app/pages/registry";

type FederatedRegistryPageProps = RegistryPageProps & FederatedProps;

const FederatedRegistryPage: React.FunctionComponent<FederatedRegistryPageProps> = () => {
    return (<RegistryPage />);
}

export default FederatedRegistryPage;
