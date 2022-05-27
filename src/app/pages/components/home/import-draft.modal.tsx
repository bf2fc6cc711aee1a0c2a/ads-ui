import React, {FunctionComponent, useEffect, useState} from "react";
import {
    Alert,
    Button, FileUpload, Form,
    FormGroup,
    Modal,
    ModalVariant,
    Select, SelectOption, SelectOptionObject,
    SelectVariant,
    TextArea,
    TextInput
} from "@patternfly/react-core";
import {ArtifactTypes, CreateDraft, CreateDraftContent} from "@app/models";
import {If} from "@app/components";
import {UrlUpload} from "@app/pages/components";


const IMPORT_FROM_FILE: string = "FILE";
const IMPORT_FROM_URL: string = "URL";


export type ImportDraftModalProps = {
    importType: "FILE" | "URL";
    isOpen: boolean | undefined;
    onImport: (event: CreateDraft, content: CreateDraftContent) => void;
    onCancel: () => void;
}


const PLACEHOLDER_TYPE_OPTION: SelectOptionObject = {
    // @ts-ignore
    value: undefined,
    label: "Select a type...",
    toString: () => {
        return "Select a type...";
    },
    compareTo(selectOption: any): boolean {
        return selectOption === this;
    }
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
        },
        compareTo(selectOption: any): boolean {
            return this.value === selectOption.value;
        }
    };
});


type DetectionInfo = {
    type?: string;
    version?: string;
    name?: string;
    summary?: string;
}


export const ImportDraftModal: FunctionComponent<ImportDraftModalProps> = ({importType, isOpen, onImport, onCancel}: ImportDraftModalProps) => {
    const [isValid, setValid] = useState(false);

    const [draftContent, setDraftContent] = useState<string>();
    const [fileName, setFileName] = useState<string>();
    const [url, setUrl] = useState<string>();

    const [name, setName] = useState("");
    const [summary, setSummary] = useState("");

    const [type, setType] = useState<string>();
    const [typeSelection, setTypeSelection] = useState<SelectOptionObject>();
    const [isTypeToggled, setTypeToggled] = useState(false);

    const [version, setVersion] = useState("");
    const [isVersionToggled, setVersionToggled] = useState(false);

    const onFileChange = (value: string | File, fname: string): void => {
        setDraftContent(value as string);
        setFileName(fname);
    };

    const onUrlChange = (value: string|undefined, url: string|undefined): void => {
        setDraftContent(value);
        setUrl(url);
    };

    // Called when the user changes the "type" (dropdown)
    const onTypeSelect = (selection: SelectOptionObject): void => {
        setTheType((selection as any).value);
        setTypeToggled(false);
    };

    // Called when the user changes the "version" (dropdown)
    const onVersionSelect = (selection: string): void => {
        setVersion(selection);
        setVersionToggled(false);
    };

    // Called when the user clicks the Import button in the modal
    const doImport = (): void => {
        const cd: CreateDraft = {
            type: type as string,
            name,
            summary
        };
        const cdc: CreateDraftContent = {
            // TODO handle non-JSON content types (i.e. YAML content)
            contentType: "application/json",
            data: draftContent
        };

        onImport(cd, cdc);
    };

    const hasDraftContent = (): boolean => {
        return draftContent !== undefined && draftContent.trim().length > 0;
    };

    const title = (): string => {
        if (importType === IMPORT_FROM_FILE) {
            return "Import from file";
        } else {
            return "Import from URL";
        }
    };

    // Tries to figure out the type and meta-data of the content by parsing it and looking
    // for key indicators.
    const detectInfo = (content: string): DetectionInfo => {
        try {
            const parsed: any = JSON.parse(content);
            if (parsed.openapi) {
                return {
                    type: ArtifactTypes.OPENAPI,
                    version: "3.0.2",
                    name: parsed.info?.title,
                    summary: parsed.info?.description
                };
            }
            if (parsed.swagger) {
                return {
                    type: ArtifactTypes.OPENAPI,
                    version: "2.0",
                    name: parsed.info?.title,
                    summary: parsed.info?.description
                };
            }
            if (parsed.asyncapi) {
                return {
                    type: ArtifactTypes.ASYNCAPI,
                    name: parsed.info?.title,
                    summary: parsed.info?.description
                };
            }
            if (parsed.$schema) {
                return {
                    type: ArtifactTypes.JSON,
                    name: parsed.title,
                    summary: parsed.description
                };
            }
            return {
                type: ArtifactTypes.AVRO,
                name: parsed.name
            };
        } catch (e) {
            // Do nothing - it wasn't JSON!
        }

        // Default: nothing detected
        return {
        };

        // TODO handle parsing of YAML content
        // TODO handle parsing of protobuf
        // TODO handle parsing of GraphQL
        // TODO handle parsing of XML
    };

    const setTheType = (newType: string|undefined): void => {
        if (newType === undefined) {
            setType(undefined);
            setTypeSelection(undefined);
        } else {
            setType(newType);
            // @ts-ignore (there really is a value on the option)
            const newTypeSelection: SelectOptionObject = TYPE_OPTIONS.filter(option => option.value === newType)[0];
            setTypeSelection(newTypeSelection);
        }
    };

    // Validate the form inputs.
    useEffect(() => {
        let valid: boolean = true;
        if (!draftContent) {
            valid = false;
        }
        if (!name) {
            valid = false;
        }
        if (!type) {
            valid = false;
        }
        setValid(valid);
    }, [name, summary, type, draftContent]);

    // Whenever the modal is opened, set default values for the form.
    useEffect(() => {
        setDraftContent(undefined);
        setName("");
        setSummary("");
        setTheType(undefined);
    }, [isOpen]);

    // Whenever the content changes (e.g. loaded from file) try to detect the
    // type of the content.
    useEffect(() => {
        if (draftContent && draftContent.trim().length > 0) {
            const info: DetectionInfo = detectInfo(draftContent as string);
            console.debug("[ImportDraftModal] Content detection: ", info);
            console.debug("[ImportDraftModal] Version detected: ", info.version || "");

            setTheType(info.type);
            setVersion(info.version || "");
            setName(info.name || "");
            setSummary(info.summary || "");
        } else {
            console.debug("[ImportDraftModal] Content empty, resetting form fields.");
            setName("");
            setSummary("");
            setTheType(undefined);
        }
    }, [draftContent]);

    // Whenever the type changes to OpenAPI, set the version to "3.0.2".
    useEffect(() => {
        if (type === ArtifactTypes.OPENAPI && version === undefined) {
            setVersion("3.0.2");
        }
    }, [type]);

    return (
        <Modal
            variant={ModalVariant.medium}
            title={title()}
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
            <Alert isInline variant="warning" title="Warning" style={{marginBottom: "15px"}}>
                <p>
                    All new drafts are stored locally in your browser. Clearing your browser cache or
                    switching to a new browser <em>might</em> result in loss of data. Make sure you save your
                    work locally or in a Red Hat OpenShift Service Registry instance!
                </p>
            </Alert>

            <Form>
                <If condition={importType === IMPORT_FROM_FILE}>
                    <FormGroup label="File" isRequired={true} fieldId="import-draft-file">
                        <FileUpload
                            isRequired={true}
                            id="draft-text-file"
                            type="text"
                            value={draftContent}
                            filename={fileName}
                            filenamePlaceholder="Drag and drop a file or upload one"
                            onChange={onFileChange}
                        />
                    </FormGroup>
                </If>
                <If condition={importType === IMPORT_FROM_URL}>
                    <FormGroup label="URL" isRequired={true} fieldId="import-draft-url">
                        <UrlUpload
                            id="draft-text-url"
                            urlPlaceholder="Enter a valid and accessible URL"
                            onChange={onUrlChange}
                        />
                    </FormGroup>
                </If>
                <If condition={hasDraftContent}>
                    <FormGroup label="Type" isRequired={true} fieldId="import-draft-type">
                        <Select
                            variant={SelectVariant.single}
                            aria-label="Select type"
                            onToggle={() => setTypeToggled(!isTypeToggled)}
                            onSelect={(event, selection) => onTypeSelect(selection)}
                            isOpen={isTypeToggled}
                            selections={typeSelection}
                            menuAppendTo="parent"
                        >
                            {
                                [
                                    <SelectOption key={-1} value={PLACEHOLDER_TYPE_OPTION} isPlaceholder={true}/>,
                                    ...TYPE_OPTIONS.map((to, index) => <SelectOption key={index} value={to}/>)
                                ]
                            }
                        </Select>
                    </FormGroup>
                    <If condition={type === ArtifactTypes.OPENAPI}>
                        <FormGroup label="Version" isRequired={true} fieldId="import-draft-version">
                            <Select
                                variant={SelectVariant.single}
                                aria-label="Select version"
                                onToggle={() => setVersionToggled(!isVersionToggled)}
                                onSelect={(event, selection) => onVersionSelect(selection as string)}
                                isOpen={isVersionToggled}
                                selections={version}
                                menuAppendTo="parent"
                            >
                                <SelectOption key={1} value="3.0.2"/>
                                <SelectOption key={2} value="2.0"/>
                            </Select>
                        </FormGroup>
                    </If>
                    <FormGroup label="Name" isRequired={true} fieldId="import-draft-name">
                        <TextInput
                            isRequired
                            type="text"
                            id="import-draft-name"
                            name="import-draft-name"
                            aria-describedby="import-draft-name-helper"
                            value={name}
                            onChange={(value) => setName(value)}
                        />
                    </FormGroup>
                    <FormGroup label="Summary" fieldId="import-draft-summary">
                        <TextArea
                            type="text"
                            id="import-draft-summary"
                            name="import-draft-summary"
                            aria-describedby="import-draft-summary-helper"
                            value={summary}
                            onChange={(value) => setSummary(value)}
                        />
                    </FormGroup>
                </If>
            </Form>
        </Modal>
    )
};
