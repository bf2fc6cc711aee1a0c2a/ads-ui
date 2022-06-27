import {AlertVariant, useAlert} from "@rhoas/app-services-ui-shared";
import {Design} from "@app/models";
import {ExportToRhosrData, RenameData} from "@app/pages/components";
import React from "react";
import {RegistryNavLink} from "@app/components";


export interface AlertsService {
    designDeleted(design: Design): void;
    designDeleteFailed(design: Design, error: any): void;
    designSaved(design: Design): void;
    designRenamed(event: RenameData): void;
    designExportedToRhosr(event: ExportToRhosrData): void;
}


/**
 * React hook to get the Alerts service.
 */
export const useAlertsService: () => AlertsService = (): AlertsService => {
    const { addAlert } = useAlert() || {};

    return {
        designDeleted(design: Design): void {
            addAlert({
                title: "Delete successful",
                description: `Design '${design.name}' was successfully deleted.`,
                variant: AlertVariant.success,
                dataTestId: "toast-design-deleted"
            });
        },

        designDeleteFailed(design: Design, error: any): void {
            addAlert({
                title: "Delete failed",
                description: `Failed to delete design '${design.name}'.  ${error}`,
                variant: AlertVariant.danger,
                dataTestId: "toast-design-delete-error"
            });
        },

        designRenamed(event: RenameData): void {
            addAlert({
                title: "Details successfully changed",
                description: `Details (name, summary) of design '${event.name}' were successfully changed.`,
                variant: AlertVariant.success,
                dataTestId: "toast-design-renamed"
            });
        },

        designSaved(design: Design): void {
            addAlert({
                title: "Save successful",
                description: `Design '${design?.name}' was successfully saved.`,
                variant: AlertVariant.success,
                dataTestId: "toast-design-saved"
            });
        },

        designExportedToRhosr(event: ExportToRhosrData): void {
            const description: React.ReactNode = (
                <React.Fragment>
                    <div>{`Design '${event.design.name}' was successfully exported to Service Registry.`}</div>
                    <RegistryNavLink registry={event.registry} context={event.context}>View artifact overview</RegistryNavLink>
                </React.Fragment>
            );

            addAlert({
                title: "Export successful",
                description,
                variant: AlertVariant.success,
                dataTestId: "toast-design-registered"
            });
        },
    };
};
