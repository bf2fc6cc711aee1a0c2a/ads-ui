import {Design} from "@app/models";

export interface DesignsSearchResults {
    designs: Design[];
    count: number;
    page: number;
    pageSize: number;
}
