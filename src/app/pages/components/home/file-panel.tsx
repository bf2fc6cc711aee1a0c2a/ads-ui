import React, {FunctionComponent, useState} from "react";
import {Card, CardBody, CardTitle, FileUpload} from "@patternfly/react-core";

export type FilePanelProps = {
}

export const FilePanel: FunctionComponent<FilePanelProps> = ({}: FilePanelProps) => {
    const [ value, setValue ] = useState("");
    const [ filename, setFilename ] = useState("");

    return (
        <Card isSelectable={false}>
            <CardTitle>Open a File/URL</CardTitle>
            <CardBody>
                <FileUpload
                    id="text-file-with-edits-allowed"
                    type="text"
                    value={value}
                    filename={filename}
                    filenamePlaceholder="Drag and drop a file or upload one"
                    isLoading={false}
                    allowEditingUploadedText
                    browseButtonText="Open"
                />
            </CardBody>
        </Card>

    );
};
