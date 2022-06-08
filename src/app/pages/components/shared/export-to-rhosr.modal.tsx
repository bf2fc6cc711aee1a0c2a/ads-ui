import React, {FunctionComponent, useEffect, useState} from "react";
import "./export-to-rhosr.modal.css";
import {Button, Form, FormGroup, Modal, ModalVariant, Spinner, TextInput} from "@patternfly/react-core";
import {Draft} from "@app/models";
import {Registry} from "@rhoas/registry-management-sdk";
import {
    DraftsService,
    RhosrInstanceService,
    RhosrInstanceServiceFactory,
    RhosrService,
    useDraftsService,
    useRhosrInstanceServiceFactory,
    useRhosrService
} from "@app/services";
import {If, IsLoading, ObjectSelect} from "@app/components";
import {DraftContext} from "@app/models/drafts/draft-context.model";
import {CreateOrUpdateArtifactData} from "@app/models/rhosr-instance/create-or-update-artifact-data.model";

export type ExportToRhosrData = {
    draft: Draft;
    context: DraftContext;
};

export type ExportToRhosrModalProps = {
    draft: Draft;
    isOpen: boolean | undefined;
    onExported: (event: ExportToRhosrData) => void;
    onCancel: () => void;
}


export const ExportToRhosrModal: FunctionComponent<ExportToRhosrModalProps> = (
    {draft, isOpen, onExported, onCancel}: ExportToRhosrModalProps) => {

    const [isValid, setValid] = useState(false);
    const [isExporting, setExporting] = useState(false);
    const [isLoadingRegistries, setLoadingRegistries] = useState(true);
    const [registries, setRegistries] = useState([] as Registry[]);
    const [registry, setRegistry] = useState<Registry>();
    const [group, setGroup] = useState<string>();
    const [artifactId, setArtifactId] = useState<string>();
    const [version, setVersion] = useState<string>();
    const [rhosrInstance, setRhosrInstance] = useState<RhosrInstanceService>();

    const drafts: DraftsService = useDraftsService();
    const rhosr: RhosrService = useRhosrService();
    const rhosrInstanceFactory: RhosrInstanceServiceFactory = useRhosrInstanceServiceFactory();

    // Called when the user clicks "export"
    const doExport = () => {
        setExporting(true);
        drafts.getDraftContent(draft.id).then(content => {
            const data: CreateOrUpdateArtifactData = {
                type: draft.type,
                groupId: group,
                id: artifactId,
                version: version,
                content: content.data,
                contentType: content.contentType
            };
            rhosrInstance?.createOrUpdateArtifact(data).then(amd => {
                // TODO take the info from the artifact meta-data and return it as a context
                const context: DraftContext = {
                    type: "rhosr",
                    rhosr: {
                        instanceId: registry?.id as string,
                        groupId: amd.groupId as string,
                        artifactId: amd.id,
                        version: amd.version
                    }
                };
                const event: ExportToRhosrData = {
                    draft,
                    context
                };
                setExporting(false);
                onExported(event);
            }).catch(error => {
                // TODO error handling
            });
        }).catch(error => {
            // TODO error handling
        });
    };

    const onRegistrySelect = (registry: Registry): void => {
        setRegistry(registry);
    };

    useEffect(() => {
        if (isOpen) {
            setLoadingRegistries(true);
            // Get the list of registries.
            rhosr.getRegistries().then(registries => {
                setRegistries(registries.sort((a, b) => {
                    const name1: string = a.name as string;
                    const name2: string = b.name as string;
                    return name1.localeCompare(name2);
                }));
                if (registries && registries.length > 0) {
                    setRegistry(registries[0]);
                }
                setLoadingRegistries(false);
            }).catch(error => {
                // TODO handle this error case
                console.error("[HomePage] Error getting registry list: ", error);
            });
        }
    }, [isOpen]);

    useEffect(() => {
        if (draft && draft.contexts && draft.contexts.length > 0) {
            const filteredContexts: DraftContext[] = draft.contexts.filter(ctx => ctx.type === "rhosr");
            if (filteredContexts.length > 0) {
                const context: DraftContext = filteredContexts[0];
                setGroup(context.rhosr?.groupId);
                setArtifactId(context.rhosr?.artifactId);
                setVersion(context.rhosr?.version);
            }
        }
    }, [draft]);

    // Set the validity whenever one of the relevant state variables changes.
    useEffect(() => {
        let valid: boolean = true;
        if (!registry) {
            valid = false;
        }
        setValid(valid);
    }, [registry, group, artifactId, version]);

    // Whenever the registry changes, create a rhosr instance service for it.
    useEffect(() => {
        if (registry) {
            const rhosrInstance: RhosrInstanceService = rhosrInstanceFactory.createFor(registry as Registry);
            setRhosrInstance(rhosrInstance);
        }
    }, [registry]);

    return (
        <Modal
            variant={ModalVariant.medium}
            title="Export to Service Registry"
            isOpen={isOpen}
            onClose={onCancel}
            actions={[
                <Button key="export" variant="primary" isDisabled={!isValid || isExporting} onClick={doExport}>
                    <If condition={isExporting}>
                        <Spinner size="md" className="export-spinner" />
                    </If>
                    Export
                </Button>,
                <Button key="cancel" variant="link" onClick={onCancel}>
                    Cancel
                </Button>
            ]}
        >
            <IsLoading condition={isLoadingRegistries}>
                <Form>
                    <FormGroup label="Registry Instance" isRequired={true} fieldId="export-registry-instance">
                        <ObjectSelect value={registry} items={registries}
                                      onSelect={onRegistrySelect}
                                      menuAppendTo="parent"
                                      itemToString={item => item.name} />
                    </FormGroup>
                    <FormGroup label="Group" isRequired={false} fieldId="export-group">
                        <TextInput
                            isRequired
                            type="text"
                            id="export-group"
                            name="export-group"
                            placeholder="Enter group ID (optional) or leave blank for default group"
                            aria-describedby="export-group-helper"
                            value={group}
                            onChange={(value) => setGroup(value)}
                        />
                    </FormGroup>
                    <FormGroup label="Artifact Id" isRequired={false} fieldId="export-artifact-id">
                        <TextInput
                            isRequired
                            type="text"
                            id="export-artifact-id"
                            name="export-artifact-id"
                            placeholder="Enter artifact ID (optional) or leave blank for generated ID"
                            aria-describedby="export-artifact-id-helper"
                            value={artifactId}
                            onChange={(value) => setArtifactId(value)}
                        />
                    </FormGroup>
                    <FormGroup label="Version" isRequired={false} fieldId="export-version">
                        <TextInput
                            isRequired
                            type="text"
                            id="export-version"
                            name="export-version"
                            placeholder="Enter version (optional) or leave blank for generated version #"
                            aria-describedby="export-version-helper"
                            value={version}
                            onChange={(value) => setVersion(value)}
                        />
                    </FormGroup>
                </Form>
            </IsLoading>
        </Modal>
    )
};
