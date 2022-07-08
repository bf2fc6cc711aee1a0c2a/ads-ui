import { SearchedArtifact } from "@app/models";

export interface ArtifactSearchResults {
    artifacts: SearchedArtifact[];
    count: number;
    page: number;
    pageSize: number;
}
