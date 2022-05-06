import {ArtifactTypes, CreateDraft, Draft, DraftContent} from "@app/models";

async function createDraft(info: CreateDraft): Promise<Draft> {
    return Promise.resolve({
        id: "12345",
        type: ArtifactTypes.AVRO,
        name: "Mock Draft",
        summary: "This is a mock object.",
        createdOn: new Date(),
        modifiedOn: new Date()
    });
}

async function getDrafts(): Promise<Draft[]> {
    return Promise.resolve([
        {
            id: "12345",
            type: ArtifactTypes.AVRO,
            name: "Mock Draft #1",
            summary: "This is the first mock draft.",
            createdOn: new Date(),
            modifiedOn: new Date()
        },
        {
            id: "12346",
            type: ArtifactTypes.AVRO,
            name: "Mock Draft #2",
            summary: "This is the second mock draft.",
            createdOn: new Date(),
            modifiedOn: new Date()
        }
    ]);
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
