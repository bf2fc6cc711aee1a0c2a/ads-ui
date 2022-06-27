import {useRhosrService} from "@app/services";
import {Button, Form, FormGroup, Modal, ModalVariant, TextInput} from "@patternfly/react-core";
import {Registry} from "@rhoas/registry-management-sdk";
import React, {useEffect, useState} from "react";
import {Design} from "@app/models";
import {IsLoading, ObjectSelect} from "@app/components";
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
	const [isLoadingRegistries, setLoadingRegistries] = useState(true);
	const [registries, setRegistries] = useState<Registry[]>([]);
	const [registry, setRegistry] = useState<Registry>();
	const [formState, setFormState] = useState(initialFormState);
	const [isValid, setValid] = useState(false);

	const rhosr = useRhosrService();

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
		if (isOpen) {
			setLoadingRegistries(true);
			// Get the list of registries.
			rhosr.getRegistries().then(registries => {
				setRegistries(registries.sort((a, b) => {
					const name1: string = a.name as string;
					const name2: string = b.name as string;
					return name1.localeCompare(name2);
				}));
				setRegistry(defaultRegistry(registries));
				setLoadingRegistries(false);
			}).catch(error => {
				// TODO handle this error case
				console.error("[HomePage] Error getting registry list: ", error);
			});
		}
	}, [isOpen]);

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
			<IsLoading condition={isLoadingRegistries}>
				<Form>
					<FormGroup
						isRequired={true}
						label="Registry instance"
						fieldId="test-in-registry-registry-instance"
					>
						<ObjectSelect value={registry} items={registries} onSelect={setRegistry} itemToString={item => item.name} />
					</FormGroup>
					<FormGroup
						label="Group"
						validated={formState.groupValue.validated}
						helperTextInvalid={formState.groupValue.errorMessage}
						fieldId="test-in-registry-group"
					>
						<TextInput
							id="test-in-registry-group"
							value={formState.groupValue.value}
							placeholder="Enter group (optional) or leave blank for default group"
							onChange={setGroupValue} />
					</FormGroup>
					<FormGroup
						label="ID"
						validated={formState.artifactIdValue.validated}
						helperTextInvalid={formState.artifactIdValue.errorMessage}
						isRequired={true}
						fieldId="test-in-registry-artifactId"
					>
						<TextInput
							id="test-in-registry-artifactId"
							placeholder="Enter ID of artifact"
							value={formState.artifactIdValue.value}
							onChange={setArtifactIdValue} />
					</FormGroup>
				</Form>
			</IsLoading>
		</Modal>
	);
}
