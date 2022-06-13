import {Design} from "@app/models";
import {DesignContext, DesignContextType} from "@app/models/designs/design-context.model";

export function hasContext(design: Design, contextType: DesignContextType): boolean {
    if (design.contexts) {
        const filteredContexts: DesignContext[] = design.contexts.filter(ctx => ctx.type === contextType);
        return filteredContexts.length > 0;
    }
    return false;
};

export function getContexts(design: Design, contextType: DesignContextType): DesignContext[] {
    if (design.contexts) {
        return design.contexts.filter(ctx => ctx.type === contextType);
    }
    return [];
};
