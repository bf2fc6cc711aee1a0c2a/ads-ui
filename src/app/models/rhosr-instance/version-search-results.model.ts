import { SearchedVersion } from "@app/models";

export interface VersionSearchResults {
    versions: SearchedVersion[];
    count: number;
}
