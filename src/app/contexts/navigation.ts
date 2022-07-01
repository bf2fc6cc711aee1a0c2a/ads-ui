import { Basename, useBasename } from "@rhoas/app-services-ui-shared";
import { History } from "history";
import { useHistory } from "react-router-dom";

export const navigateTo: (path: string, basename: Basename, history: History) => void = (path: string, basename: Basename, history: History) => {
    const to = `${basename.getBasename()}${path}`;
    setTimeout(() => {
        history.push(to);
    }, 50);
};

export type Navigation = {
    navigateTo: (path: string) => void;
};

export const useNavigation: () => Navigation = (): Navigation => {
    const history: History = useHistory();
    const basename: Basename = useBasename();

    return {
        navigateTo: (path: string) => {
            return navigateTo(path, basename, history);
        }
    };
};
