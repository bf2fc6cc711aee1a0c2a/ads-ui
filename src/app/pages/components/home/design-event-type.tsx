import React, {FunctionComponent} from "react";
import {DesignEvent} from "@app/models";
import {DesignContext} from "@app/models/designs/design-context.model";


export type DesignEventTypeProps = {
    event: DesignEvent;
    variant?: "long" | "short";  // Default is "long"
};


export const DesignEventType: FunctionComponent<DesignEventTypeProps> = ({event, variant}: DesignEventTypeProps) => {

    const typeLabel = (): string => {
        switch (event.type) {
            case "download":
                return variant === "short" ? "Local file" : "Downloaded to local file system";
            case "create":
                return variant === "short" ? "New" : "Created new design";
            case "import":
                return importTypeLabel();
            case "register":
                return variant === "short" ? "Service Registry" : "Registered in Service Registry";
            case "update":
                return variant === "short" ? "Edited" : "Modified using the editor";
        }
    };

    const importTypeLabel = (): string => {
        const context: DesignContext = event.data.context;
        switch (context.type) {
            case "file":
                return variant === "short" ? "Local file" : `Imported from local file ${context.file?.fileName}`;
            case "rhosr":
                return variant === "short" ? "Service Registry" : `Imported from Service Registry artifact (${context.rhosr?.groupId||'default'}/${context.rhosr?.artifactId}/${context.rhosr?.version||'latest'})`;
            case "url":
                return variant === "short" ? "URL" : `Imported from URL ${context.url?.url}`
        }
        return "Imported content";
    };

    return (
        <span>{typeLabel()}</span>
    );
};
