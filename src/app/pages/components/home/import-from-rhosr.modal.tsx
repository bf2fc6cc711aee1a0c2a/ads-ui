import React, {FunctionComponent, useEffect, useState} from "react";
import {Button, Modal, ModalVariant} from "@patternfly/react-core";
import {ArtifactTypes, CreateDraft, CreateDraftContent, SearchedArtifact, SearchedVersion} from "@app/models";
import {Registry} from "@rhoas/registry-management-sdk";
import {RhosrService, useRhosrService} from "@app/services";
import {IsLoading} from "@app/components";
import {ArtifactSelector} from "@app/pages/components";


export type ImportFromRhosrModalProps = {
    isOpen: boolean | undefined;
    onImport: (event: CreateDraft, content: CreateDraftContent) => void;
    onCancel: () => void;
}


export const ImportFromRhosrModal: FunctionComponent<ImportFromRhosrModalProps> = ({isOpen, onImport, onCancel}: ImportFromRhosrModalProps) => {
    const [isValid, setValid] = useState(false);
    const [isLoading, setLoading] = useState(true);
    const [registries, setRegistries] = useState([] as Registry[]);
    const [draft, setDraft] = useState<CreateDraft>();
    const [draftContent, setDraftContent] = useState<CreateDraftContent>();

    const rhosr: RhosrService = useRhosrService();

    // Called when the user selects an artifact from the artifact selector.
    const onArtifactSelected = (artifact: SearchedArtifact, content: CreateDraftContent): void => {
        if (artifact === undefined) {
            setDraft(undefined);
            setDraftContent(undefined);
        } else {
            const cd: CreateDraft = {
                type: artifact.type,
                name: artifact.name || artifact.id,
                summary: artifact.description || ""
            };
            setDraft(cd);
            setDraftContent(content);
        }
    };

    // Called when the user clicks the Import button in the modal
    const doImport = (): void => {
        onImport(draft as CreateDraft, draftContent as CreateDraftContent);
    };

    useEffect(() => {
        if (isOpen) {
            // Get the list of registries.
            rhosr.getRegistries().then(registries => {
                setRegistries(registries.sort((a, b) => {
                    const name1: string = a.name as string;
                    const name2: string = b.name as string;
                    return name1.localeCompare(name2);
                }));
                setLoading(false);
            }).catch(error => {
                // TODO handle this error case
                console.error("[HomePage] Error getting registry list: ", error);
            });
        }
    }, [isOpen]);

    useEffect(() => {
        let valid: boolean = true;
        if (draft === undefined) {
            valid = false;
        }
        setValid(valid);
    }, [draft, draftContent]);

    return (
        <Modal
            variant={ModalVariant.large}
            title="Import from Service Registry"
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
            <IsLoading condition={isLoading}>
                <ArtifactSelector registries={registries} onSelected={onArtifactSelected} />
            </IsLoading>
        </Modal>
    )
};
