import {CreateDraftContent} from "@app/models/drafts/create-draft-content.model";

export interface Template {

    id: string;
    name: string;
    content: CreateDraftContent

}
