import { useRhosrService } from "@app/services";
import { Button, Dropdown, DropdownItem, DropdownToggle, Form, FormGroup, Modal, ModalVariant, Popover, TextInput } from "@patternfly/react-core";
import { Registry } from "@rhoas/registry-management-sdk";
import React, { useEffect, useState } from "react";
import {Design} from "@app/models";
import {ObjectSelect} from "@app/components";

export interface TestRegistryArgs {
	registry: Registry
	group?: string
	artifactId: string
}

export interface TestRegistryFormModalProps {
	design: Design;
	isOpen?: boolean;
	onCancel: () => void;
	onSubmit: (registry: Registry, groupId: string | undefined, artifactId: string) => void;
}

type ValidatedValue = "error" | "default" | "warning" | "success" | undefined;

const initialFormState = {
	hasErrors: false,
	groupValue: {
		value: "",
		validated: "default" as ValidatedValue,
		errorMessage: ""
	},
	artifactIdValue: {
		value: "",
		validated: "default" as ValidatedValue,
		errorMessage: ""
	}
}

export const TestRegistryFormModal: React.FunctionComponent<TestRegistryFormModalProps> = ({design, isOpen, onCancel, onSubmit}) => {
	const [registries, setRegistries] = useState<Registry[]>([]);
	const [registry, setRegistry] = useState<Registry>();
	const [formState, setFormState] = useState(initialFormState);

	const rhosrService = useRhosrService();

	useEffect(() => {
		rhosrService.getRegistries().then((results) => {
			setRegistries(results);
			setRegistry(results[0]);
		}).catch((error) => {
			console.error("[TestRegistryForm] Error fetching available registries: ", error);
		});
	}, []);

	useEffect(() => {
		if (design && design.origin && design.origin.type === "rhosr") {
			setFormState({
				...formState,
				artifactIdValue: {
					...formState.artifactIdValue,
					value: design.origin.rhosr?.artifactId as string
				},
				groupValue: {
					...formState.groupValue,
					value: design.origin.rhosr?.groupId as string
				}
			})
		}
	}, [design]);

	const registryDropdownItems = (registries: Registry[]) => registries.map((registry => <DropdownItem key={`registry-${registry.id}`} data-id={registry.id}>{registry.name}</DropdownItem>));

	const setGroupValue = (val: string) => {
		setFormState({
			...formState,
			groupValue: {
				...formState.groupValue,
				validated: "default",
				value: val
			}
		});
	}

	const setArtifactIdValue = (val: string) => {
		const hasErrors = !val;

		setFormState({
			...formState,
			hasErrors,
			artifactIdValue: {
				...formState.artifactIdValue,
				validated: hasErrors ? "error" : "default",
				errorMessage: "Artifact ID is a required field.",
				value: val
			}
		});
	}

	return (
		<Modal
			variant={ModalVariant.medium}
			title="Test in Service Registry"
			isOpen={isOpen}
			onClose={onCancel}
			actions={[
				<Button key="confirm" variant="primary" onClick={() => onSubmit(
					registry as Registry,
					formState.groupValue.value,
					formState.artifactIdValue.value
				)}>
					Test
				</Button>,
				<Button key="cancel" variant="link" onClick={onCancel}>
					Cancel
				</Button>
			]}
		>
			<Form>
				<FormGroup
					label="Registry instance"
					fieldId="modal-with-form-form-registry-instance"
				>
					<ObjectSelect value={registry} items={registries} onSelect={setRegistry} itemToString={item => item.name} />
				</FormGroup>
				<FormGroup
					label="Group"
					validated={formState.groupValue.validated}
					helperTextInvalid={formState.groupValue.errorMessage}
					fieldId="modal-with-form-form-group"
				>
					<TextInput value={formState.groupValue.value} onChange={setGroupValue} />
				</FormGroup>
				<FormGroup
					label="Artifact ID"
					validated={formState.artifactIdValue.validated}
					helperTextInvalid={formState.artifactIdValue.errorMessage}
					isRequired
					fieldId="modal-with-form-form-artifactId"
				>
					<TextInput
						id="modal-with-form-form-artifactId"
						value={formState.artifactIdValue.value}
						onChange={setArtifactIdValue} />
				</FormGroup>
			</Form>
		</Modal>
	);
}
