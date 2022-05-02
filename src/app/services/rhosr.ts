import {Configuration, Registry, RegistriesApi, RegistryList} from '@rhoas/registry-management-sdk';
import {Auth, useAuth, Config, useConfig} from "@rhoas/app-services-ui-shared";

/**
 * Async function to get the RHOSR instances.  Uses a provided auth token and API
 * base path to create a RHOSR SDK instance.
 * @param auth the application auth
 * @param basePath base path of the fleet manager API
 */
async function getRegistries(auth: Auth, basePath: string): Promise<Registry[]> {
    console.debug("[RhosrService] Getting a list of registries from: ", basePath);
    const token: string | undefined = await auth?.srs.getToken();
    const api: RegistriesApi = new RegistriesApi(
        new Configuration({
            accessToken: token,
            basePath,
        })
    );
    return api.getRegistries().then(res => {
        const registries: RegistryList = res?.data;
        return registries.items;
    });
}

/**
 * Gets information about a single registry instances by its unique ID.
 * @param id the registry instance ID
 * @param auth the application auth
 * @param basePath base path of the fleet manager API
 */
async function getRegistry(id: string, auth: Auth, basePath: string): Promise<Registry> {
    console.debug("[RhosrService] Getting a single registry from: ", basePath);
    const token: string | undefined = await auth?.srs.getToken();
    const api: RegistriesApi = new RegistriesApi(
        new Configuration({
            accessToken: token,
            basePath,
        })
    );
    return api.getRegistry(id).then(res => {
        return res?.data;
    });
}


/**
 * The RHOSR Service interface.
 */
export interface RhosrService {
    getRegistries(): Promise<Registry[]>;
    getRegistry(id: string): Promise<Registry>;
}


/**
 * A no-op version of the RHOSR service. Used when authentication is not available, and therefore
 * the RHOSR fleet manager cannot be invoked.
 */
const noAuthService: RhosrService = {
    getRegistries(): Promise<Registry[]> {
        return Promise.resolve([]);
    },
    getRegistry(id: string): Promise<Registry> {
        return Promise.resolve({} as Registry);
    }
};


/**
 * React hook to get the RHOSR service.
 */
export const useRhosrService: () => RhosrService = (): RhosrService => {
    const auth: Auth = useAuth();
    const cfg: Config = useConfig();

    // If auth is not defined, then return the no-op version of the RHOSR service.
    if (!auth.srs) {
        console.warn("[RhosrService] Authentication not enabled, using no-op RHOSR service.");
        return noAuthService;
    }

    return {
        getRegistries: () => {
            return getRegistries(auth, cfg.srs.apiBasePath);
        },
        getRegistry: (id) => {
            return getRegistry(id, auth, cfg.srs.apiBasePath);
        }
    };
};
