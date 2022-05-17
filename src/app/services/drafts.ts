import {CreateDraft, Draft, DraftContent, DraftsSearchCriteria, DraftsSearchResults, Paging} from "@app/models";
import Dexie, { Table } from "dexie";
import { v4 as uuidv4 } from "uuid";
import {CreateDraftContent} from "@app/models/drafts/create-draft-content.model";


const db = new Dexie("draftsDB");
db.version(2).stores({
    drafts: "++id, type, name, summary, createdOn, modifiedOn", // Primary key and indexed props
    content: "++id, data"
});


async function createDraft(cd: CreateDraft, cdc: CreateDraftContent): Promise<Draft> {
    const id: string = uuidv4();
    const newDraft: Draft = {
        id,
        name: cd.name,
        summary: cd.summary,
        type: cd.type,
        createdOn: new Date(),
        modifiedOn: new Date()
    };
    const newDraftContent: DraftContent = {
        id,
        contentType: cdc.contentType,
        data: cdc.data
    };
    return Promise.all([
        // @ts-ignore
        db.drafts.add(newDraft),
        // @ts-ignore
        db.content.add(newDraftContent)
    ]).then(() => newDraft);
}

async function getDrafts(): Promise<Draft[]> {
    // @ts-ignore
    return db.drafts.toArray();
}

async function searchDrafts(criteria: DraftsSearchCriteria, paging: Paging): Promise<DraftsSearchResults> {
    console.debug("[DraftsService] Searching for drafts: ", criteria, paging);
    const accept = (draft: Draft): boolean => {
        let matches: boolean = false;
        if (!criteria.filterValue || criteria.filterValue.trim().length === 0) {
            matches = true;
        } else if (draft.name.toLowerCase().indexOf(criteria.filterValue.toLowerCase()) >= 0) {
            matches = true;
        } else if (draft.summary && draft.summary.toLowerCase().indexOf(criteria.filterValue.toLowerCase()) >= 0) {
            matches = true;
        }
        return matches;
    };

    return getDrafts().then(drafts => {
        // TODO Explore whether we can use dexie to filter and page the results.

        // filter and sort the results
        const filteredDrafts: Draft[] = drafts.filter(accept).sort((draft1, draft2) => {
            let rval: number = draft1.name.localeCompare(draft2.name);
            if (!criteria.ascending) {
                rval *= -1;
            }
            return rval;
        });
        // get the total count
        const totalCount: number = filteredDrafts.length;
        // get the subset of results based on paging
        const start: number = (paging.page - 1) * paging.pageSize;
        const end: number = start + paging.pageSize;
        const pagedDrafts: Draft[] = filteredDrafts.slice(start, end);
        return {
            drafts: pagedDrafts,
            page: paging.page,
            pageSize: paging.pageSize,
            count: totalCount
        }
    });
}


async function getDraft(id: string): Promise<Draft> {
    // @ts-ignore
    return db.drafts.where("id").equals(id).first();
}

async function deleteDraft(id: string): Promise<void> {
    // @ts-ignore
    return db.drafts.where("id").equals(id).delete();
}

async function getDraftContent(id: string): Promise<DraftContent> {
    // @ts-ignore
    return db.content.where("id").equals(id).first();
}

async function updateDraftContent(content: DraftContent): Promise<void> {
    return Promise.all([
        // @ts-ignore
        db.content.update(content.id, {
            data: content.data
        }),
        // @ts-ignore
        db.drafts.update(content.id, {
            modifiedOn: new Date()
        })
    ]).then(() => {});
}


/**
 * The Drafts Service interface.
 */
export interface DraftsService {
    createDraft(cd: CreateDraft, cdc: CreateDraftContent): Promise<Draft>;
    getDrafts(): Promise<Draft[]>;
    getDraft(id: string): Promise<Draft>;
    searchDrafts(criteria: DraftsSearchCriteria, paging: Paging): Promise<DraftsSearchResults>;
    deleteDraft(id: string): Promise<void>;
    getDraftContent(id: string): Promise<DraftContent>;
    updateDraftContent(content: DraftContent): Promise<void>;
}


/**
 * React hook to get the Drafts service.
 */
export const useDraftsService: () => DraftsService = (): DraftsService => {
    return {
        createDraft,
        getDrafts,
        searchDrafts,
        getDraft,
        deleteDraft,
        getDraftContent,
        updateDraftContent
    };
};
