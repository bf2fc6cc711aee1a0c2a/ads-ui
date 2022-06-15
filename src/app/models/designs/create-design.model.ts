import {DesignContext} from "@app/models/designs/design-context.model";

export interface CreateDesign {

    type: string;
    name: string;
    summary: string|undefined;
    context: DesignContext;

}
