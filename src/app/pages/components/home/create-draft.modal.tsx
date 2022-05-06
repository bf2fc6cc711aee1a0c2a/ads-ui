import React, {FunctionComponent} from "react";
import {Button, Modal, ModalVariant} from "@patternfly/react-core";
import {CreateDraft} from "@app/models";

export type CreateDraftModalProps = {
    isOpen: boolean|undefined;
    onCreate: (event: CreateDraft) => void;
    onCancel: () => void;
}

export const CreateDraftModal: FunctionComponent<CreateDraftModalProps> = ({isOpen, onCreate, onCancel}: CreateDraftModalProps) => {

    return (
        <Modal
            variant={ModalVariant.medium}
            title="Create a new design"
            isOpen={isOpen}
            onClose={onCancel}
            actions={[
                <Button key="confirm" variant="primary">
                    Create draft
                </Button>,
                <Button key="cancel" variant="link" onClick={onCancel}>
                    Cancel
                </Button>
            ]}
        >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
            magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
            consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
            est laborum.
        </Modal>
    );
};
