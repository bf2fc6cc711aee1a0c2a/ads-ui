import { Configuration, RegistriesApi, Registry, RegistryList } from "@rhoas/registry-management-sdk";
import { Auth, Config, useAuth, useConfig } from "@rhoas/app-services-ui-shared";
import { LocalStorageService, useLocalStorageService } from "@app/services/local-storage";

const RHOSR_MOCK_DATA: Registry[] = [
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    {
        id: "1",
        name: "Local Registry 1 (localhost:8081)",
        registryUrl: "http://localhost:8081/",
        browserUrl: "http://localhost:8081/ui/",
        status: "ready",
        created_at: "2022-01-01T12:00:00Z",
        updated_at: "2022-01-01T12:00:00Z",
        instance_type: "standard"
    },
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    {
        id: "2",
        name: "Local Registry 2 (localhost:8082)",
        registryUrl: "http://localhost:8082/",
        browserUrl: "http://localhost:8082/ui/",
        status: "ready",
        created_at: "2022-01-01T12:00:00Z",
        updated_at: "2022-01-01T12:00:00Z",
        instance_type: "standard"
    }
];

const RHOSR_MOCK_DATA_OF: Registry[] = [
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    {
        id: "101",
        name: "Operate First Registry 1",
        registryUrl: "https://apicurio-registry-mem-one.apps.smaug.na.operate-first.cloud/",
        browserUrl: "https://apicurio-registry-mem-one.apps.smaug.na.operate-first.cloud/ui/",
        status: "ready",
        created_at: "2022-01-01T12:00:00Z",
        updated_at: "2022-01-01T12:00:00Z",
        instance_type: "standard"
    },
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    {
        id: "201",
        name: "Operate First Registry 2",
        registryUrl: "https://apicurio-registry-mem-two.apps.smaug.na.operate-first.cloud/",
        browserUrl: "https://apicurio-registry-mem-two.apps.smaug.na.operate-first.cloud/ui/",
        status: "ready",
        created_at: "2022-01-01T12:00:00Z",
        updated_at: "2022-01-01T12:00:00Z",
        instance_type: "standard"
    }
];


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
    return api.getRegistries(1, 50).then(res => {
        const registries: RegistryList = res?.data;
        return registries.items;
    });
}

/**
 * Gets information about a single registry instances by its unique ID.
 * @param auth the application auth
 * @param local the local storage service
 * @param id the registry instance ID
 * @param basePath base path of the fleet manager API
 */
async function getRegistry(auth: Auth, local: LocalStorageService, id: string, basePath: string): Promise<Registry> {
    console.debug("[RhosrService] Getting a single registry from: ", basePath);
    const cacheKey: string = `services.rhosr.getRegistry.${id}`;
    const cachedRegistry: Registry | undefined = local.getConfigProperty(cacheKey, undefined) as Registry | undefined;

    if (cachedRegistry) {
        // TODO limit the TTL of the cache entry somehow
        console.debug("[RhosrService] Cache hit for registry with ID: ", id);
        return Promise.resolve(cachedRegistry);
    }

    const token: string | undefined = auth?.srs ? await auth?.srs.getToken() : "";
    const api: RegistriesApi = new RegistriesApi(
        new Configuration({
            accessToken: token,
            basePath,
        })
    );
    return api.getRegistry(id).then(res => {
        const registry: Registry = res?.data as Registry;
        local.setConfigProperty(cacheKey, registry);
        return registry;
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
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(mockData);
                }, 150);
            });
        },
        getRegistry(id: string): Promise<Registry> {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const matching: Registry[] = mockData.filter(registry => registry.id === id);
                    if (matching && matching.length > 0) {
                        return resolve(matching[0]);
                    } else {
                        return resolve({} as Registry);
                    }
                }, 150);
            });
        }
    };
}

let mockWarningSent: boolean = false;
const mockWarning = (message: string): void => {
    if (!mockWarningSent) {
        console.info("[RhosrService] ----------------------------------");
        console.info("[RhosrService]", message);
        console.info("[RhosrService] ----------------------------------");
        mockWarningSent = true;
    }
};

/**
 * React hook to get the RHOSR service.
 */
export const useRhosrService: () => RhosrService = (): RhosrService => {
    const auth: Auth = useAuth();
    const cfg: Config = useConfig();
    const local: LocalStorageService = useLocalStorageService();

    if (cfg.srs.apiBasePath && cfg.srs.apiBasePath.startsWith("local-mock")) {
        mockWarning("RHOSR mocking enabled.");
        return createMockService(RHOSR_MOCK_DATA);
    }

    if (cfg.srs.apiBasePath && cfg.srs.apiBasePath.startsWith("operate-first-mock")) {
        mockWarning("RHOSR mocking enabled (Operate First).");
        return createMockService(RHOSR_MOCK_DATA_OF);
    }

    return {
        getRegistries: () => getRegistries(auth, cfg.srs.apiBasePath),
        getRegistry: (id) => getRegistry(auth, local, id, cfg.srs.apiBasePath),
    };
};
