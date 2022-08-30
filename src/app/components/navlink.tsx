import React, { FunctionComponent } from "react";
import { Link } from "react-router-dom";
import { Basename, useBasename } from "@rhoas/app-services-ui-shared";

export type NavLinkProps = {
    location: string;
    title?: string;
    className?: string;
    children?: React.ReactNode;
}

export const NavLink: FunctionComponent<NavLinkProps> = ({ location, title, className, children }: NavLinkProps) => {

    const basename: Basename = useBasename();
    const to: string = `${basename.getBasename()}${location}`;

    return (
        <Link className={className} title={title} to={to} children={children} />
    );
};
