import {useRhosrService} from "@app/services";
import {Button, Form, FormGroup, Modal, ModalVariant, TextInput} from "@patternfly/react-core";
import {Registry} from "@rhoas/registry-management-sdk";
import React, {useEffect, useState} from "react";
import {Design} from "@app/models";
import {ObjectSelect} from "@app/components";
import {cloneObject} from "@app/utils";


export interface TestRegistryModalProps {
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

export const TestRegistryModal: React.FunctionComponent<TestRegistryModalProps> = ({design, isOpen, onCancel, onSubmit}) => {
	const [registries, setRegistries] = useState<Registry[]>([]);
	const [registry, setRegistry] = useState<Registry>();
	const [formState, setFormState] = useState(initialFormState);
	const [isValid, setValid] = useState(false);

	const rhosrService = useRhosrService();

	const defaultRegistry = (registries: Registry[]): Registry | undefined => {
		if (design?.origin?.type === "rhosr" && design.origin.rhosr?.instanceId) {
			const filtered: Registry[] = registries.filter(registry => registry.id === design.origin.rhosr?.instanceId);
			if (filtered && filtered.length > 0) {
				return filtered[0];
			}
		}
		return registries.length > 0 ? registries[0] : undefined;
	}

	useEffect(() => {
		rhosrService.getRegistries().then((results) => {
			setRegistries(registries.sort((a, b) => {
				const name1: string = a.name as string;
				const name2: string = b.name as string;
				return name1.localeCompare(name2);
			}));
			setRegistry(defaultRegistry(results));
		}).catch((error) => {
			console.error("[TestRegistry] Error fetching available registries: ", error);
		});
	}, []);

	useEffect(() => {
		if (isOpen && design && design.origin && design.origin.type === "rhosr") {
			const state: any = cloneObject(initialFormState);
			state.groupValue.value = design.origin.rhosr?.groupId as string
			state.artifactIdValue.value = design.origin.rhosr?.artifactId as string;
			setFormState(state);
		} else {
			setFormState(initialFormState);
		}
	}, [isOpen]);

	useEffect(() => {
		setValid(formState.artifactIdValue.value !== undefined && formState.artifactIdValue.value.length > 0);
	}, [formState]);

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
				errorMessage: "ID is a required field.",
				value: val
			}
		});
	}

	return (
		<Modal
			variant={ModalVariant.medium}
			title="Test using Service Registry"
			isOpen={isOpen}
			onClose={onCancel}
			actions={[
				<Button key="confirm" isDisabled={!isValid} variant="primary" onClick={() => onSubmit(
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
					isRequired={true}
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
					<TextInput
						value={formState.groupValue.value}
						placeholder="Enter group (optional) or leave blank for default group"
						onChange={setGroupValue} />
				</FormGroup>
				<FormGroup
					label="ID"
					validated={formState.artifactIdValue.validated}
					helperTextInvalid={formState.artifactIdValue.errorMessage}
					isRequired={true}
					fieldId="modal-with-form-form-artifactId"
				>
					<TextInput
						id="modal-with-form-form-artifactId"
						placeholder="Enter ID of artifact"
						value={formState.artifactIdValue.value}
						onChange={setArtifactIdValue} />
				</FormGroup>
			</Form>
		</Modal>
	);
}
