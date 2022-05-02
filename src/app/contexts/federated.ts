import {createContext, useContext} from "react";

export type FederatedProps = {
    tokenEndPointUrl: string;
};

export const FederatedContext = createContext<FederatedProps | undefined>(
    undefined
);
export const useFederated = (): FederatedProps | undefined =>
    useContext(FederatedContext);
