import {ArtifactTypes, CreateDraft, Draft, DraftContent} from "@app/models";
import Dexie, { Table } from "dexie";
import { v4 as uuidv4 } from "uuid";


const db = new Dexie("draftsDB");
db.version(1).stores({
    drafts: "++id, type, name, summary, createdOn, modifiedOn" // Primary key and indexed props
});


async function createDraft(info: CreateDraft): Promise<Draft> {
    const newDraft: Draft = {
        id: uuidv4(),
        name: info.name,
        summary: info.summary,
        type: info.type,
        createdOn: new Date(),
        modifiedOn: new Date()
    };
    // @ts-ignore
    await db.drafts.add(newDraft);
    return Promise.resolve(newDraft);
}

async function getDrafts(): Promise<Draft[]> {
    // @ts-ignore
    return db.drafts.toArray();
}

async function getDraft(): Promise<Draft> {
    return Promise.resolve({
        id: "12345",
        type: ArtifactTypes.AVRO,
        name: "Mock Draft",
        summary: "This is a mock object.",
        createdOn: new Date(),
        modifiedOn: new Date()
    });
}

async function getDraftContent(): Promise<DraftContent> {
    return Promise.resolve({
        id: "12345",
        contentType: "application/json",
        data: "{}"
    });
}


/**
 * The Drafts Service interface.
 */
export interface DraftsService {
    createDraft(info: CreateDraft): Promise<Draft>;
    getDrafts(): Promise<Draft[]>;
    getDraft(id: string): Promise<Draft>;
    getDraftContent(id: string): Promise<DraftContent>;
}


/**
 * React hook to get the Drafts service.
 */
export const useDraftsService: () => DraftsService = (): DraftsService => {
    return {
        createDraft,
        getDrafts,
        getDraft,
        getDraftContent
    };
};
