import React from "react";
import { FederatedProps } from "@app/contexts";
import { HomePage, HomePageProps } from "@app/pages/home";

type FederatedHomePageProps = HomePageProps & FederatedProps;

const FederatedHomePage: React.FunctionComponent<FederatedHomePageProps> = () => {
    return (<HomePage />);
}

export default FederatedHomePage;
