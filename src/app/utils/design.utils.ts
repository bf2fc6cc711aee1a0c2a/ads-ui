import {Design} from "@app/models";
import {DesignContext, DesignContextType} from "@app/models/designs/design-context.model";

export function hasOrigin(design: Design|undefined, contextType: DesignContextType): boolean {
    return design?.origin?.type === contextType;
};
