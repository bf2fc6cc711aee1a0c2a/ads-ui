import { useRhosrService } from "@app/services";
import { Button, Dropdown, DropdownItem, DropdownToggle, Form, FormGroup, Modal, ModalVariant, Popover, TextInput } from "@patternfly/react-core";
import { HelpIcon } from "@patternfly/react-icons";
import { Registry } from "@rhoas/registry-management-sdk";
import React, { useEffect, useState } from "react";

export interface DryRunArgs {
	registry: Registry
	group?: string
	artifactId: string
}

export interface RegistryDryRunFormModalProps {
	isOpen?: boolean;
	onCancel: () => void;
	onSubmit: (registry: Registry, groupId: string | undefined, artifactId: string) => void;
}

type ValidatedValue = "error" | "default" | "warning" | "success" | undefined;

const initialFormState = {
	hasErrors: false,
	groupValue: {
		value: '',
		validated: 'default' as ValidatedValue,
		errorMessage: ""
	},
	artifactIdValue: {
		value: '6a44eac0-ac69-459c-baf6-3f21e7bb12d0',
		validated: 'default' as ValidatedValue,
		errorMessage: ""
	}
}

export const RegistryDryRunFormModal: React.FunctionComponent<RegistryDryRunFormModalProps> = (props) => {
	const [registryList, setRegistryList] = useState<Registry[]>([]);
	const [registryValue, setRegistryValue] = useState<Registry>();
	const [formState, setFormState] = useState(initialFormState);

	const [isRegistryInstanceDropdownOpen, setIsRegistryInstanceDropdownOpen] = useState(false);

	const rhosrService = useRhosrService();

	useEffect(() => {
		rhosrService.getRegistries().then((results) => {
			setRegistryList(results);
			setRegistryValue(results[0]);
		}).catch((error) => {
			console.error("[RegistryDryRunForm] Error fetching available registries: ", error);
		});
	}, []);

	const onToggleRegistryInstanceDropdown = (isOpen: boolean) => {
		setIsRegistryInstanceDropdownOpen(isOpen);
	};

	const onSelectRegistryInstance: (event?: React.SyntheticEvent<HTMLDivElement>) => void = (event) => {
		// @ts-ignore
		const registryId: string = event?.target.attributes["data-id"].value;
		rhosrService.getRegistry(registryId).then(setRegistryValue).catch(error => {
			console.log(`[RegistryDryRunForm] Error fetching registry with ID ${registryId} registries:`, error);
		});
		setIsRegistryInstanceDropdownOpen(false);
	}

	const registryDropdownItems = (registries: Registry[]) => registries.map((registry => <DropdownItem key={'registry-' + registry.id} data-id={registry.id}>{registry.name}</DropdownItem>));

	const setGroupValue = (val: string) => {
		setFormState({
			...formState,
			groupValue: {
				...formState.groupValue,
				validated: 'default',
				value: val
			}
		})
	}

	const setArtifactIdValue = (val: string) => {
		const hasErrors = !val;

		setFormState({
			...formState,
			hasErrors,
			artifactIdValue: {
				...formState.artifactIdValue,
				validated: hasErrors ? 'error' : 'default',
				errorMessage: 'Artifact ID is a required field.',
				value: val
			}
		});
	}

	return (
		<Modal
			variant={ModalVariant.medium}
			title="Registration dry-run"
			isOpen={props.isOpen}
			onClose={props.onCancel}
			actions={[
				<Button key="confirm" variant="primary" onClick={() => props.onSubmit(
					registryValue as Registry,
					formState.groupValue.value,
					formState.artifactIdValue.value
				)}>
					Run dry-run
				</Button>,
				<Button key="cancel" variant="link" onClick={props.onCancel}>
					Cancel
				</Button>
			]}
		>
			<Form>
				<FormGroup
					label="Registry instance"
					labelIcon={
						<Popover
							headerContent="TODO title"
							bodyContent="TODO body"
						>
							<button
								type="button"
								aria-label="More info for Registry instance field"
								onClick={e => e.preventDefault()}
								aria-describedby="modal-with-form-form-registry-instance"
								className="pf-c-form__group-label-help"
							>
								<HelpIcon noVerticalAlign />
							</button>
						</Popover>
					}
					fieldId="modal-with-form-form-registry-instance"
				>
					<Dropdown
						onSelect={onSelectRegistryInstance}
						menuAppendTo="parent"
						toggle={
							<DropdownToggle id="toggle-basic" onToggle={onToggleRegistryInstanceDropdown}>
								{registryValue ? registryValue.name : 'Select a Registry instance'}
							</DropdownToggle>
						}
						isOpen={isRegistryInstanceDropdownOpen}
						dropdownItems={registryDropdownItems(registryList)}
					/>
				</FormGroup>
				<FormGroup
					label="Group"
					validated={formState.groupValue.validated}
					helperTextInvalid={formState.groupValue.errorMessage}
					labelIcon={
						<Popover
							headerContent="TODO title"
							bodyContent="TODO body"
						>
							<button
								type="button"
								aria-label="More info for Group field"
								onClick={e => e.preventDefault()}
								aria-describedby="modal-with-form-form-group"
								className="pf-c-form__group-label-help"
							>
								<HelpIcon noVerticalAlign />
							</button>
						</Popover>
					}
					fieldId="modal-with-form-form-group"
				>
					<TextInput value={formState.groupValue.value} onChange={setGroupValue} />
				</FormGroup>
				<FormGroup
					label="Artifact ID"
					validated={formState.artifactIdValue.validated}
					helperTextInvalid={formState.artifactIdValue.errorMessage}
					labelIcon={
						<Popover
							headerContent="TODO title"
							bodyContent="TODO body"
						>
							<button
								type="button"
								aria-label="More info for Artifact ID field"
								onClick={e => e.preventDefault()}
								aria-describedby="modal-with-form-form-artifactId"
								className="pf-c-form__group-label-help"
							>
								<HelpIcon noVerticalAlign />
							</button>
						</Popover>
					}
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