import {CreateDraft, Draft, DraftContent} from "@app/models";
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
        getDraft,
        deleteDraft,
        getDraftContent,
        updateDraftContent
    };
};
