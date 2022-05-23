import React, {FunctionComponent, useEffect, useState} from "react";
import {
    Alert,
    Button,
    Form,
    FormGroup, Gallery, GalleryItem,
    Modal,
    ModalVariant,
    Select,
    SelectOption,
    SelectOptionObject,
    SelectVariant,
    TextArea,
    TextInput
} from "@patternfly/react-core";
import {ArtifactTypes, CreateDraft, Template} from "@app/models";
import {TemplatesService, useTemplatesService} from "@app/services";
import {If} from "@app/components";
import {TemplateItem} from "@app/pages/components";

export type CreateDraftModalProps = {
    isOpen: boolean|undefined;
    onCreate: (event: CreateDraft, template: Template) => void;
    onCancel: () => void;
}


const TYPE_OPTIONS: SelectOptionObject[] = [
    {
        value: ArtifactTypes.OPENAPI,
        label: "OpenAPI"
    },
    {
        value: ArtifactTypes.ASYNCAPI,
        label: "AsyncAPI"
    },
    {
        value: ArtifactTypes.AVRO,
        label: "Apache Avro"
    },
    {
        value: ArtifactTypes.JSON,
        label: "JSON Schema"
    },
    {
        value: ArtifactTypes.PROTOBUF,
        label: "Google Protocol Buffers"
    },
].map(item => {
    return {
        value: item.value,
        label: item.label,
        toString: () => {
            return item.label;
        }
    };
});


export const CreateDraftModal: FunctionComponent<CreateDraftModalProps> = ({isOpen, onCreate, onCancel}: CreateDraftModalProps) => {
    const [isValid, setValid] = useState(false);
    const [name, setName] = useState("");
    const [summary, setSummary] = useState("");

    const [type, setType] = useState(ArtifactTypes.OPENAPI);
    const [typeSelection, setTypeSelection] = useState<SelectOptionObject>();
    const [isTypeToggled, setTypeToggled] = useState(false);

    const [version, setVersion] = useState("");
    const [isVersionToggled, setVersionToggled] = useState(false);

    const [templates, setTemplates] = useState<Template[]>();
    const [template, setTemplate] = useState<Template>();

    const templatesSvc: TemplatesService = useTemplatesService();


    // Called when the user changes the "type" (dropdown)
    const onTypeSelect = (selection: SelectOptionObject): void => {
        setType((selection as any).value);
        setTypeSelection(selection);
        setTypeToggled(false);
    };

    // Called when the user changes the "version" (dropdown)
    const onVersionSelect = (selection: string): void => {
        setVersion(selection);
        setVersionToggled(false);
    };

    // Called when the user clicks the Create button in the modal
    const doCreate = (): void => {
        const cd: CreateDraft = { type, name, summary };
        onCreate(cd, template as Template);
    };

    // Validate the form inputs.
    useEffect(() => {
        let valid: boolean = true;
        if (!name) {
            valid = false;
        }
        if (!type) {
            valid = false;
        }
        if (!template) {
            valid = false;
        }
        setValid(valid);
    }, [name, summary, type, template]);

    // Whenever the modal is opened, set default values for the form.
    useEffect(() => {
        setName("");
        setSummary("");
        setType(ArtifactTypes.OPENAPI);
        if (templates) {
            setTemplate(templates[0]);
        } else {
            setTemplate(undefined);
        }
    }, [isOpen]);

    // Whenever the type changes, load the templates for that type. If the type is
    // OpenAPI, set the version to "3.0.2".
    useEffect(() => {
        if (type === ArtifactTypes.OPENAPI) {
            setVersion("3.0.2");
        }
        templatesSvc.getTemplatesFor(type, version).then(setTemplates);
    }, [type]);

    // Whenever the version changes, fetch the templates for the current type and version.
    useEffect(() => {
        templatesSvc.getTemplatesFor(type, version).then(setTemplates);
    }, [version]);

    // Whenever the templates changes, auto-select the first one
    useEffect(() => {
        if (templates && templates.length > 0) {
            setTemplate(templates[0]);
        }
    }, [templates]);

    return (
        <Modal
            variant={ModalVariant.medium}
            title="Create a new design"
            isOpen={isOpen}
            onClose={onCancel}
            actions={[
                <Button key="create" variant="primary" isDisabled={!isValid} onClick={doCreate}>
                    Create
                </Button>,
                <Button key="cancel" variant="link" onClick={onCancel}>
                    Cancel
                </Button>
            ]}
        >
            <Alert isInline variant="warning" title="Warning" style={{ marginBottom: "15px"}}>
                <p>
                    All new drafts are stored locally in your browser.  Clearing your browser cache or
                    switching to a new browser <em>might</em> result in loss of data.  Make sure you save your
                    work locally or in a Red Hat OpenShift Service Registry instance!
                </p>
            </Alert>

            <Form>
                <FormGroup label="Name" isRequired={true} fieldId="create-draft-name">
                    <TextInput
                        isRequired
                        type="text"
                        id="create-draft-name"
                        name="create-draft-name"
                        aria-describedby="create-draft-name-helper"
                        value={name}
                        onChange={(value) => {setName(value)}}
                    />
                </FormGroup>
                <FormGroup label="Summary" fieldId="create-draft-summary">
                    <TextArea
                        type="text"
                        id="create-draft-summary"
                        name="create-draft-summary"
                        aria-describedby="create-draft-summary-helper"
                        value={summary}
                        onChange={(value) => {setSummary(value)}}
                    />
                </FormGroup>
                <FormGroup label="Type" isRequired={true} fieldId="create-draft-type">
                    <Select
                        variant={SelectVariant.single}
                        aria-label="Select type"
                        onToggle={() => {setTypeToggled(!isTypeToggled)}}
                        onSelect={(event, selection) => onTypeSelect(selection)}
                        isOpen={isTypeToggled}
                        selections={typeSelection}
                        menuAppendTo="parent"
                    >
                        {
                            TYPE_OPTIONS.map(to => <SelectOption key={(to as any).value} value={to} />)
                        }
                    </Select>
                </FormGroup>
                <If condition={type === ArtifactTypes.OPENAPI}>
                    <FormGroup label="Version" isRequired={true} fieldId="create-draft-version">
                        <Select
                            variant={SelectVariant.single}
                            aria-label="Select version"
                            onToggle={() => {setVersionToggled(!isVersionToggled)}}
                            onSelect={(event, selection) => onVersionSelect(selection as string)}
                            isOpen={isVersionToggled}
                            selections={version}
                            menuAppendTo="parent"
                        >
                            <SelectOption value={"3.0.2"} />
                            <SelectOption value={"2.0"} />
                        </Select>
                    </FormGroup>
                </If>
                <If condition={(templates && templates.length > 1) as boolean}>
                    <FormGroup label="Template" fieldId="create-draft-template">
                        <Gallery hasGutter minWidths={{default: "125px"}} maxWidths={{default: "125px"}}>
                        {
                            templates?.map(t => (
                                <GalleryItem key={t.id}>
                                    <TemplateItem template={t} isSelected={t === template} onSelect={() => {
                                        setTemplate(t)
                                    }} />
                                </GalleryItem>
                            ))
                        }
                        </Gallery>
                    </FormGroup>
                </If>
            </Form>
        </Modal>
    );
};
