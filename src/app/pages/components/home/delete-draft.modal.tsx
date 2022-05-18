import React, {FunctionComponent, useEffect, useState} from "react";
import {Alert, Button, Checkbox, Form, FormGroup, Modal, ModalVariant, Text, TextContent} from "@patternfly/react-core";
import {Draft} from "@app/models";

export type DeleteDraftModalProps = {
    draft: Draft|undefined;
    isOpen: boolean|undefined;
    onDelete: (draft: Draft) => void;
    onCancel: () => void;
    onDownload: (draft: Draft) => void;
}

export const DeleteDraftModal: FunctionComponent<DeleteDraftModalProps> = ({draft, isOpen, onDelete, onDownload, onCancel}: DeleteDraftModalProps) => {
    const [isValid, setValid] = useState(false);

    // Called when the user clicks the Delete button in the modal
    const doDelete = (): void => {
        onDelete(draft as Draft);
    };

    const doDownload = (): void => {
        onDownload(draft as Draft);
    };

    useEffect(() => {
        setValid(false);
    }, [draft, isOpen]);

    return (
        <Modal
            variant={ModalVariant.small}
            title="Delete design?"
            titleIconVariant="warning"
            isOpen={isOpen}
            onClose={onCancel}
            actions={[
                <Button key="delete" variant="primary" isDisabled={!isValid} onClick={doDelete}>
                    Create
                </Button>,
                <Button key="cancel" variant="link" onClick={onCancel}>
                    Cancel
                </Button>
            ]}
        >
            <TextContent style={{marginBottom: "15px"}}>
                <Text component="p">The following API or schema design will be deleted.</Text>
            </TextContent>

            <Form>
                <FormGroup label="Name" fieldId="delete-draft-name">
                    <TextContent>{draft?.name}</TextContent>
                </FormGroup>
                <FormGroup label="Summary" fieldId="delete-draft-summary">
                    <TextContent>{draft?.summary}</TextContent>
                </FormGroup>
                <FormGroup fieldId="delete-draft-warning">
                    <Alert isInline variant="info" title="To save your data for future use, download the design.">
                        <p style={{lineHeight: "18px"}}>
                            To ensure you data is successfully saved, wait for the download to complete
                            before deleting the design.
                        </p>
                        <Button variant="link" onClick={doDownload} style={{paddingLeft:"0px"}}>Download design</Button>
                    </Alert>
                </FormGroup>
                <FormGroup fieldId="delete-draft-confirm">
                    <Checkbox id="valid-checkbox" name="" label="I have downloaded the design or do not need to!"
                              isChecked={isValid} onChange={(checked) => setValid(checked)} />
                </FormGroup>
            </Form>
        </Modal>
    );
};
