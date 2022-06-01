import {DraftContext} from "@app/models/drafts/draft-context.model";

export interface CreateDraft {

    type: string;
    name: string;
    summary: string|undefined;
    context?: DraftContext;

}
