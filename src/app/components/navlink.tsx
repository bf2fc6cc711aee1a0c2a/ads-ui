import React, {FunctionComponent} from "react";
import {Link} from "react-router-dom";
import {Basename, useBasename} from "@rhoas/app-services-ui-shared";

export type NavLinkProps = {
    location: string;
    className?: string;
    children?: React.ReactNode;
}

export const NavLink: FunctionComponent<NavLinkProps> = ({location, className, children}: NavLinkProps) => {

    const basename: Basename = useBasename();
    const to: string = `${basename.getBasename()}${location}`;

    return (
        <Link className={className} to={to} children={children} />
    );
};
