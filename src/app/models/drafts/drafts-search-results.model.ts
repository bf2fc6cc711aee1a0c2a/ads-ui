import {Draft} from "@app/models";

export interface DraftsSearchResults {
    drafts: Draft[];
    count: number;
    page: number;
    pageSize: number;
}
