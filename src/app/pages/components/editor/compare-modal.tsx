import React, {FunctionComponent, useState} from "react";
import "./compare-modal.css";
import {Button, Modal, ToggleGroup, ToggleGroupItem} from "@patternfly/react-core";
import {editor} from "monaco-editor";
import IDiffEditorConstructionOptions = editor.IDiffEditorConstructionOptions;
import {DiffEditor} from "@monaco-editor/react";

/**
 * Properties
 */
export type CompareModalProps = {
    isOpen: boolean|undefined;
    before: any;
    beforeName: string;
    after: any;
    afterName: string;
    onClose: () => void;
};

export const CompareModal: FunctionComponent<CompareModalProps> = ({isOpen, onClose, before, beforeName, after, afterName}: CompareModalProps) => {
    const [diffEditorContentOptions, setDiffEditorContentOptions] = useState({
        renderSideBySide: true,
        automaticLayout: true,
        wordWrap: "off",
        readOnly: true,
        inDiffEditor: true,
        originalAriaLabel: "Original",
        modifiedAriaLabel: "Modified"
    } as IDiffEditorConstructionOptions)

    const [isDiffInline, setIsDiffInline] = useState(false);
    const [isDiffWrapped, setIsDiffWrapped] = useState(false);

    const switchInlineCompare = () => {
        setDiffEditorContentOptions({
            ...diffEditorContentOptions as IDiffEditorConstructionOptions,
            renderSideBySide: !diffEditorContentOptions.renderSideBySide
        });
        setIsDiffInline(!!diffEditorContentOptions.renderSideBySide);
    }

    const switchWordWrap = () => {
        setDiffEditorContentOptions({
            ...diffEditorContentOptions as IDiffEditorConstructionOptions,
            wordWrap: diffEditorContentOptions.wordWrap == "off" ? "on" : "off"
        });
        setIsDiffWrapped(diffEditorContentOptions.wordWrap != "on");
    }

    return (
        <Modal id="compare-modal"
               title="Unsaved changes"
               isOpen={isOpen}
               onClose={onClose}>
            <div className="compare-view">
                <ToggleGroup className="compare-toggle-group"
                             aria-label="Compare view toggle group">
                    <ToggleGroupItem text="Inline diff" key={1} buttonId="second"
                                     isSelected={isDiffInline}
                                     onChange={switchInlineCompare}/>
                    <ToggleGroupItem text="Wrap Text" key={0} buttonId="first"
                                     isSelected={isDiffWrapped}
                                     onChange={switchWordWrap}/>
                </ToggleGroup>
                <div className="compare-label">
                    <span className="before">Original: {beforeName}</span>
                    <span className="divider"> &#8596; </span>
                    <span className="after">Modified: {afterName}</span>
                </div>
                <div className="compare-editor">
                    <DiffEditor
                        className="text-editor"
                        original={before}
                        modified={after}
                        options={diffEditorContentOptions}
                    />
                </div>
            </div>
        </Modal>

    );
};
