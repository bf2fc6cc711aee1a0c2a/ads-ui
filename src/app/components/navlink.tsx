import React, {FunctionComponent} from "react";
import {useNavigation, Navigation} from "@app/contexts/navigation";

export type NavLinkProps = {
    location: string;
    className?: string;
    children?: React.ReactNode;
}

export const NavLink: FunctionComponent<NavLinkProps> = ({location, className, children}: NavLinkProps) => {
    const nav: Navigation = useNavigation();
    return (
        <a className={className} onClick={() => nav.navigateTo(location)} children={children} />
    );
};
