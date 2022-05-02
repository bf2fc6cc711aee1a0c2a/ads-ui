import React, {FunctionComponent} from "react";
import {useNavigation, Navigation} from "@app/contexts/navigation";

export type NavLinkProps = {
    location: string;
    children?: React.ReactNode;
}

export const NavLink: FunctionComponent<NavLinkProps> = ({location, children}: NavLinkProps) => {
    const nav: Navigation = useNavigation();
    return (
        <a onClick={() => nav.navigateTo(location)} children={children} />
    );
};
