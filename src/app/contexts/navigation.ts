import {Basename} from "@rhoas/app-services-ui-shared";
import {History} from "history";

export const navigateTo: (path: string, basename: Basename, history: History) => void = (path: string, basename: Basename, history: History) => {
    const to: string = `${basename.getBasename()}${path}`;
    history.push(to);
};

export type Navigation = {
    navigateTo: (path: string) => void;
};

export const useNavigation: (basename: Basename, history: History) => Navigation = (basename: Basename, history: History): Navigation => {
    return {
        navigateTo: (path: string) => {
            return navigateTo(path, basename, history);
        }
    };
}
