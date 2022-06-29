import React, {FunctionComponent, useState} from "react";
import "./compare-modal.css";
import {Button, Modal, ToggleGroup, ToggleGroupItem} from "@patternfly/react-core";
import {EditorCompare} from "@app/editors";
import {editor} from "monaco-editor";
import IDiffEditorConstructionOptions = editor.IDiffEditorConstructionOptions;

/**
 * Properties
 */
export type CompareModalProps = {
    isOpen: boolean|undefined;
    before: any;
    after: any;
    onClose: () => void;
};

export const CompareModal: FunctionComponent<CompareModalProps> = ({isOpen, onClose, before, after}: CompareModalProps) => {
    const [diffEditorContentOptions, setDiffEditorContentOptions] = useState({
        renderSideBySide: true,
        automaticLayout: true,
        wordWrap: 'on',
        readOnly: true,
        inDiffEditor: true
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
               isOpen={isOpen}
               onClose={onClose}
               actions={[
                   <Button key="cancel" variant="link" onClick={onClose}>
                       Cancel
                   </Button>
               ]}>
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
                <div className="compare-editor">
                    <EditorCompare before={before}
                                   after={after}
                                   contentOptions={diffEditorContentOptions} />
                </div>
            </div>
        </Modal>

    );
};
