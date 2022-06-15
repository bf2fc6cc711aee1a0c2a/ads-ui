import {DesignContext} from "@app/models/designs/design-context.model";

export interface Design {

    id: string;
    type: string;
    name: string;
    summary: string|undefined;
    createdOn: Date;
    modifiedOn: Date;
    origin: DesignContext;

}
