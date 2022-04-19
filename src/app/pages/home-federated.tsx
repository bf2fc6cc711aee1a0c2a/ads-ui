import React from "react";
import HomePage, {HomePageProps} from "@app/pages/home";
import {FederatedProps} from "@app/contexts";

type FederatedHomePageProps = HomePageProps & FederatedProps;

const FederatedHomePage: React.FunctionComponent<FederatedHomePageProps> = () => {
    return (<HomePage />);
}

export default FederatedHomePage;
