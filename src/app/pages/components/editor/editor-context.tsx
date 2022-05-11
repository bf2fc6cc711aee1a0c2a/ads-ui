import React, {FunctionComponent} from "react";
import {Draft} from "@app/models";
import {Breadcrumb, BreadcrumbItem, Button, Flex, FlexItem, Text, TextContent} from "@patternfly/react-core";
import "./editor-context.css";

/**
 * Properties
 */
export type EditorContextProps = {
    draft: Draft;
    dirty: boolean;
    onSave: () => void;
    onCancel: () => void;
}

/**
 * The context of the draft when editing a draft on the editor page.
 */
export const EditorContext: FunctionComponent<EditorContextProps> = ({draft, dirty, onSave, onCancel}: EditorContextProps) => {
    return (
        <React.Fragment>
            <Breadcrumb style={{marginBottom: "10px"}}>
                <BreadcrumbItem to="/">Red Hat OpenShift API Designer</BreadcrumbItem>
                <BreadcrumbItem isActive={true}>Drafts</BreadcrumbItem>
                <BreadcrumbItem isActive={true}>{draft?.name}</BreadcrumbItem>
            </Breadcrumb>
            <Flex className="editor-context">
                <FlexItem grow={{default: "grow"}}>
                    <TextContent>
                        <Text component="h1">{draft?.name}</Text>
                    </TextContent>
                </FlexItem>
                <FlexItem className="actions">
                    <Button className="btn-save" variant="primary" onClick={onSave} isDisabled={!dirty}>Save</Button>
                    <Button className="btn-cancel" variant="secondary" onClick={onCancel}>Cancel</Button>
                </FlexItem>
            </Flex>
        </React.Fragment>
    );
};
