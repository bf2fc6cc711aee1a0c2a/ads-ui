import {Configuration, Registry, RegistriesApi, RegistryList} from '@rhoas/registry-management-sdk';
import {Auth, useAuth, Config, useConfig} from "@rhoas/app-services-ui-shared";


const RHOSR_MOCK_DATA: Registry[] = [
    {
        id: "1",
        name: "Local Registry 1 (localhost:8081)",
        registryUrl: "http://localhost:8081/",
        status: "ready",
        created_at: "2022-01-01T12:00:00Z",
        updated_at: "2022-01-01T12:00:00Z",
        instance_type: "standard"
    },
    {
        id: "2",
        name: "Local Registry 2 (localhost:8082)",
        registryUrl: "http://localhost:8082/",
        status: "ready",
        created_at: "2022-01-01T12:00:00Z",
        updated_at: "2022-01-01T12:00:00Z",
        instance_type: "standard"
    }
]


/**
 * Async function to get the RHOSR instances.  Uses a provided auth token and API
 * base path to create a RHOSR SDK instance.
 * @param auth the application auth
 * @param basePath base path of the fleet manager API
 */
async function getRegistries(auth: Auth, basePath: string): Promise<Registry[]> {
    console.debug("[RhosrService] Getting a list of registries from: ", basePath);
    const token: string | undefined = auth?.srs ? await auth?.srs.getToken() : "";
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
    const token: string | undefined = auth?.srs ? await auth?.srs.getToken() : "";
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
 * A mock version of the RHOSR service.
 */
function createMockService(mockData: Registry[]): RhosrService {
    return {
        getRegistries(): Promise<Registry[]> {
            return Promise.resolve(mockData);
        },
        getRegistry(id: string): Promise<Registry> {
            const matching: Registry[] = mockData.filter(registry => registry.id === id);
            if (matching && matching.length > 0) {
                return Promise.resolve(matching[0]);
            } else {
                return Promise.resolve({} as Registry);
            }
        }
    };
}


/**
 * React hook to get the RHOSR service.
 */
export const useRhosrService: () => RhosrService = (): RhosrService => {
    const auth: Auth = useAuth();
    const cfg: Config = useConfig();

    if (cfg.srs.apiBasePath && cfg.srs.apiBasePath.startsWith("local-mock")) {
        console.warn("[RhosrService] RHOSR mocking enabled.");
        return createMockService(RHOSR_MOCK_DATA);
    }

    return {
        getRegistries: () => getRegistries(auth, cfg.srs.apiBasePath),
        getRegistry: (id) => getRegistry(id, auth, cfg.srs.apiBasePath),
    };
};
