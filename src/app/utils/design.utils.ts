import { Design } from "@app/models";
import { DesignContextType } from "@app/models/designs/design-context.model";


export function hasOrigin(design: Design | undefined, contextType: DesignContextType): boolean {
    return design?.origin?.type === contextType;
}


export function limit(value: string | undefined, length: number): string | undefined {
    if (!value || value.length < length) {
        return value;
    }
    return value.substring(0, length - 3) + "...";
}
