import React, {FunctionComponent, useState} from "react";
import {Button, Modal, ModalVariant} from "@patternfly/react-core";

export type ImportDraftModalProps = {
    isOpen: boolean|undefined;
    onImport: () => void;
    onCancel: () => void;
}

export const ImportDraftModal: FunctionComponent<ImportDraftModalProps> = ({isOpen, onImport, onCancel}: ImportDraftModalProps) => {
    const [isValid, setValid] = useState(false);

    // Called when the user clicks the Import button in the modal
    const doImport = (): void => {
        onImport();
    };

    // TODO implement this modal
    return (
        <Modal
            variant={ModalVariant.medium}
            title="Import a design"
            isOpen={isOpen}
            onClose={onCancel}
            actions={[
                <Button key="create" variant="primary" isDisabled={!isValid} onClick={doImport}>
                    Import
                </Button>,
                <Button key="cancel" variant="link" onClick={onCancel}>
                    Cancel
                </Button>
            ]}
        >
            <h1>TBD (not yet implemented)</h1>
        </Modal>
    )
};
