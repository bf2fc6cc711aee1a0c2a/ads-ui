import {Auth, useAuth} from "@rhoas/app-services-ui-shared";
import {
    ArtifactMetaData,
    ArtifactSearchResults,
    ContentTypes,
    CreateArtifactData,
    CreateVersionData,
    GetArtifactsCriteria,
    Paging,
    SearchedVersion,
    VersionMetaData
} from "@app/models";
import {createEndpoint, createHref, createOptions, httpGet, httpPostWithReturn} from "@app/utils/rest.utils";
import {Registry} from "@rhoas/registry-management-sdk";


/**
 * Returns true if the given content is JSON formatted.
 * @param content the content to check
 */
function isJson(content: string): boolean {
    try {
        JSON.parse(content);
        return true;
    } catch (e) {
        return false;
    }
}


/**
 * Returns true if the given content is XML formatted.
 * @param content the content to check
 */
function isXml(content: string): boolean {
    try {
        const xmlParser: DOMParser = new DOMParser();
        const dom: Document = xmlParser.parseFromString(content, "application/xml");
        const isParseError: boolean = dom.getElementsByTagName("parsererror").length !== 0;
        return !isParseError;
    } catch (e) {
        return false;
    }
}


/**
 * Returns true if the given content is YAML formatted.
 * @param content the content to check
 */
function isYaml(content: string): boolean {
    // try {
    //     const parsedContent: any = YAML.parse(content);
    //     return typeof parsedContent === "object";
    // } catch (e) {
    //     return false;
    // }
    return false;
}


/**
 * Determines the content type of the given content.
 * @param type
 * @param content
 */
function determineContentType(type: string, content: string): string {
    switch (type) {
        case "PROTOBUF":
            return ContentTypes.APPLICATION_PROTOBUF;
        case "WSDL":
        case "XSD":
        case "XML":
            return ContentTypes.APPLICATION_XML;
        case "GRAPHQL":
            return ContentTypes.APPLICATION_GRAPHQL;
    }
    if (isJson(content)) {
        return ContentTypes.APPLICATION_JSON;
    } else if (isXml(content)) {
        return ContentTypes.APPLICATION_XML;
    } else if (isYaml(content)) {
        return ContentTypes.APPLICATION_YAML;
    } else {
        return "application/octet-stream";
    }
}


function normalizeGroupId(groupId: string | null): string {
    return groupId || "default";
}


async function createArtifact(auth: Auth, basePath: string, data: CreateArtifactData): Promise<ArtifactMetaData> {
    const endpoint: string = createEndpoint(basePath, "/groups/:groupId/artifacts", {groupId: data.groupId});
    const headers: any = {};
    if (data.id) {
        headers["X-Registry-ArtifactId"] = data.id;
    }
    if (data.type) {
        headers["X-Registry-ArtifactType"] = data.type;
    }
    headers["Content-Type"] = determineContentType(data.type, data.content);
    return httpPostWithReturn<any, ArtifactMetaData>(endpoint, data.content, createOptions(headers));
}


async function createArtifactVersion(auth: Auth, basePath: string, groupId: string | null, artifactId: string, data: CreateVersionData): Promise<VersionMetaData> {
    groupId = normalizeGroupId(groupId);

    const endpoint: string = createEndpoint(basePath, "/groups/:groupId/artifacts/:artifactId/versions", {
        groupId,
        artifactId
    });
    const headers: any = {};
    if (data.type) {
        headers["X-Registry-ArtifactType"] = data.type;
    }
    headers["Content-Type"] = determineContentType(data.type, data.content);
    return httpPostWithReturn<any, VersionMetaData>(endpoint, data.content, createOptions(headers));
}


async function getArtifacts(auth: Auth, basePath: string, criteria: GetArtifactsCriteria, paging: Paging): Promise<ArtifactSearchResults> {
    console.debug("[RhosrInstanceService] Getting artifacts: ", criteria, paging);
    const start: number = (paging.page - 1) * paging.pageSize;
    const end: number = start + paging.pageSize;
    const queryParams: any = {
        limit: end,
        offset: start,
        order: criteria.sortAscending ? "asc" : "desc",
        orderby: "name"
    };
    if (criteria.value) {
        if (criteria.type == "everything") {
            queryParams["name"] = criteria.value;
            queryParams["description"] = criteria.value;
            queryParams["labels"] = criteria.value;
        } else {
            queryParams[criteria.type] = criteria.value;
        }
    }
    const endpoint: string = createEndpoint(basePath, "/search/artifacts", {}, queryParams);
    return httpGet<ArtifactSearchResults>(endpoint, undefined, (data) => {
        const results: ArtifactSearchResults = {
            artifacts: data.artifacts,
            count: data.count,
            page: paging.page,
            pageSize: paging.pageSize
        };
        return results;
    });
}


async function getArtifactContent(auth: Auth, basePath: string, groupId: string | null, artifactId: string, version: string): Promise<string> {
    groupId = normalizeGroupId(groupId);

    let endpoint: string = createEndpoint(basePath, "/groups/:groupId/artifacts/:artifactId/versions/:version", {
        groupId,
        artifactId,
        version
    });
    if (version === "latest") {
        endpoint = createEndpoint(basePath, "/groups/:groupId/artifacts/:artifactId", {groupId, artifactId});
    }

    const options: any = createOptions({
        "Accept": "*"
    });
    options.maxContentLength = "5242880"; // TODO 5MB hard-coded, make this configurable?
    options.responseType = "text";
    options.transformResponse = (data: any) => data;
    return httpGet<string>(endpoint, options);
}


async function getArtifactVersions(auth: Auth, basePath: string, groupId: string | null, artifactId: string): Promise<SearchedVersion[]> {
    groupId = normalizeGroupId(groupId);

    console.info("[RhosrInstanceService] Getting the list of versions for artifact: ", groupId, artifactId);
    const endpoint: string = createEndpoint(basePath, "/groups/:groupId/artifacts/:artifactId/versions", {
        groupId,
        artifactId
    }, {
        limit: 500,
        offset: 0
    });
    return httpGet<SearchedVersion[]>(endpoint, undefined, (data) => {
        return data.versions;
    });
}


/**
 * The RHOSR Instance service interface.
 */
export interface RhosrInstanceService {
    createArtifact(data: CreateArtifactData): Promise<ArtifactMetaData>;
    createArtifactVersion(groupId: string | null, artifactId: string, data: CreateVersionData): Promise<VersionMetaData>;
    getArtifacts(criteria: GetArtifactsCriteria, paging: Paging): Promise<ArtifactSearchResults>;
    getArtifactContent(groupId: string | null, artifactId: string, version: string): Promise<string>;
    getArtifactVersions(groupId: string | null, artifactId: string): Promise<SearchedVersion[]>;
}

/**
 * Factory for creating RHOSR instance services.
 */
export interface RhosrInstanceServiceFactory {
    createFor(registry: Registry): RhosrInstanceService;
}


/**
 * React hook to get the RHOSR instance service.
 */
export const useRhosrInstanceServiceFactory: () => RhosrInstanceServiceFactory = (): RhosrInstanceServiceFactory => {
    const auth: Auth = useAuth();

    return {
        createFor: (registry) => {
            const instanceUrl: string = createHref(registry.registryUrl as string,"/apis/registry/v2");
            return {
                createArtifact: (data) => createArtifact(auth, instanceUrl, data),
                createArtifactVersion: (groupId, artifactId, data) => createArtifactVersion(auth, instanceUrl, groupId, artifactId, data),
                getArtifacts: (criteria, paging) => getArtifacts(auth, instanceUrl, criteria, paging),
                getArtifactContent: (groupId, artifactId, version) => getArtifactContent(auth, instanceUrl, groupId, artifactId, version),
                getArtifactVersions: (groupId, artifactId) => getArtifactVersions(auth, instanceUrl, groupId, artifactId),
            };
        }
    };
};
