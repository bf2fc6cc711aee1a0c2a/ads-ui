import {SearchedArtifact} from "@app/models";

export interface ArtifactsSearchResults {
    artifacts: SearchedArtifact[];
    count: number;
    page: number;
    pageSize: number;
}
