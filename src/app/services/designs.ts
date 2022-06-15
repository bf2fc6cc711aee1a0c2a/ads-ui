import {
    CreateDesign,
    CreateDesignContent,
    Design,
    DesignContent,
    DesignEvent,
    DesignsSearchCriteria,
    DesignsSearchResults,
    DesignsSort,
    Paging
} from "@app/models";
import Dexie from "dexie";
import {v4 as uuidv4} from "uuid";
import {cloneObject} from "@app/utils";


const db = new Dexie("designsDB");
db.version(3).stores({
    designs: "++id, type, name, createdOn, modifiedOn", // Primary key and indexed props
    content: "++id",
    events: "++id, type, on"
});


async function createDesign(cd: CreateDesign, cdc: CreateDesignContent): Promise<Design> {
    const id: string = uuidv4();
    const newDesign: Design = {
        id,
        name: cd.name,
        summary: cd.summary,
        type: cd.type,
        createdOn: new Date(),
        modifiedOn: new Date(),
        contexts: []
    };
    const newDesignContent: DesignContent = {
        id,
        contentType: cdc.contentType,
        data: cdc.data
    };
    const newEvent: DesignEvent = {
        id,
        type: "create",
        on: new Date(),
        data: {}
    };
    if (cd.context) {
        newDesign.contexts?.push(cloneObject(cd.context));
        newEvent.data.context = cloneObject(cd.context);
        if (cd.context.type !== "create") {
            newEvent.type = "import";
        }
    }
    // Make sure the ID is properly set always.
    newEvent.id = id;

    return Promise.all([
        // @ts-ignore
        db.designs.add(newDesign),
        // @ts-ignore
        db.content.add(newDesignContent),
        // @ts-ignore
        db.events.add(newEvent),
    ]).then(() => newDesign);
}

async function getDesigns(): Promise<Design[]> {
    // @ts-ignore
    return db.designs.toArray();
}

async function searchDesigns(criteria: DesignsSearchCriteria, paging: Paging, sort: DesignsSort): Promise<DesignsSearchResults> {
    console.debug("[DesignsService] Searching for designs: ", criteria, paging);
    const accept = (design: Design): boolean => {
        let matches: boolean = false;
        if (!criteria.filterValue || criteria.filterValue.trim().length === 0) {
            matches = true;
        } else if (design.name.toLowerCase().indexOf(criteria.filterValue.toLowerCase()) >= 0) {
            matches = true;
        } else if (design.summary && design.summary.toLowerCase().indexOf(criteria.filterValue.toLowerCase()) >= 0) {
            matches = true;
        }
        return matches;
    };

    return getDesigns().then(designs => {
        // TODO Explore whether we can use dexie to filter and page the results.

        // filter and sort the results
        const filteredDesigns: Design[] = designs.filter(accept).sort((design1, design2) => {
            let rval: number = sort.by === "name" ? (
                design1.name.localeCompare(design2.name)
            ) : (
                design2.modifiedOn.getTime() - design1.modifiedOn.getTime()
            );
            if (sort.direction !== "asc") {
                rval *= -1;
            }
            return rval;
        });
        // get the total count
        const totalCount: number = filteredDesigns.length;
        // get the subset of results based on paging
        const start: number = (paging.page - 1) * paging.pageSize;
        const end: number = start + paging.pageSize;
        const pagedDesigns: Design[] = filteredDesigns.slice(start, end);
        return {
            designs: pagedDesigns,
            page: paging.page,
            pageSize: paging.pageSize,
            count: totalCount
        }
    });
}


async function getDesign(id: string): Promise<Design> {
    // @ts-ignore
    return db.designs.where("id").equals(id).first();
}

async function deleteDesign(id: string): Promise<void> {
    return Promise.all([
        // @ts-ignore
        db.designs.where("id").equals(id).delete(),
        // @ts-ignore
        db.content.where("id").equals(id).delete(),
        // @ts-ignore
        db.events.where("id").equals(id).delete(),
    ]).then(r => {});
}

async function getDesignContent(id: string): Promise<DesignContent> {
    // @ts-ignore
    return db.content.where("id").equals(id).first();
}

async function updateDesignContent(content: DesignContent): Promise<void> {
    const newEvent: DesignEvent = {
        id: content.id,
        type: "update",
        on: new Date(),
        data: {}
    };

    return Promise.all([
        // @ts-ignore
        db.content.update(content.id, {
            data: content.data
        }),
        // @ts-ignore
        db.designs.update(content.id, {
            modifiedOn: new Date()
        }),
        // @ts-ignore
        db.events.add(newEvent),
    ]).then(() => {});
}


async function getEvents(id: string): Promise<DesignEvent[]> {
    // @ts-ignore
    return db.events.where("id").equals(id).toArray();
}


async function createEvent(event: DesignEvent): Promise<void> {
    // @ts-ignore
    return db.events.add(event);
}


/**
 * The Designs Service interface.
 */
export interface DesignsService {
    createDesign(cd: CreateDesign, cdc: CreateDesignContent): Promise<Design>;
    getDesigns(): Promise<Design[]>;
    getDesign(id: string): Promise<Design>;
    searchDesigns(criteria: DesignsSearchCriteria, paging: Paging, sort: DesignsSort): Promise<DesignsSearchResults>;
    deleteDesign(id: string): Promise<void>;
    getDesignContent(id: string): Promise<DesignContent>;
    updateDesignContent(content: DesignContent): Promise<void>;
    getEvents(id: string): Promise<DesignEvent[]>;
    createEvent(event: DesignEvent): Promise<void>;
}


/**
 * React hook to get the Designs service.
 */
export const useDesignsService: () => DesignsService = (): DesignsService => {
    return {
        createDesign,
        getDesigns,
        searchDesigns,
        getDesign,
        deleteDesign,
        getDesignContent,
        updateDesignContent,
        getEvents,
        createEvent
    };
};
