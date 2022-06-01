import {DraftContext} from "@app/models/drafts/draft-context.model";

export interface Draft {

    id: string;
    type: string;
    name: string;
    summary: string|undefined;
    createdOn: Date;
    modifiedOn: Date;
    contexts?: DraftContext[];

}
