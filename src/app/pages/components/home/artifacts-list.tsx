import React, {FunctionComponent} from "react";
import {SearchedArtifact} from "@app/models";
import {DataList, DataListItemRow, DataListItemCells, DataListCell, Badge} from "@patternfly/react-core";
import {ArtifactTypeIcon} from "@app/components";
import {ArtifactGroup, ArtifactName} from "@app/pages/components";
import "./artifacts-list.css";

/**
 * Properties
 */
export type ArtifactsListProps = {
    artifacts?: SearchedArtifact[];
}

/**
 * A list of artifacts in a RHOSR instance.
 */
export const ArtifactsList: FunctionComponent<ArtifactsListProps> = ({artifacts}: ArtifactsListProps) => {

    const labels = (artifact: SearchedArtifact): string[] => {
        return artifact.labels ? artifact.labels : [];
    };
    const statuses = (artifact: SearchedArtifact): string[] => {
        const rval: string[] = [];
        if (artifact.state === "DISABLED") {
            rval.push("Disabled");
        }
        if (artifact.state === "DEPRECATED") {
            rval.push("Deprecated");
        }
        return rval;
    };
    const description = (artifact: SearchedArtifact): string => {
        if (artifact.description) {
            return artifact.description;
        }
        return `An artifact of type ${artifact.type} with no description.`;
    };

    return (
        <DataList aria-label="List of artifacts" className="artifact-list">
            {
                artifacts?.map( (artifact, idx) =>
                    <DataListItemRow className="artifact-list-item" key={artifact.id}>
                        <DataListItemCells
                            dataListCells={[
                                <DataListCell key="type icon" className="type-icon-cell">
                                    <ArtifactTypeIcon type={artifact.type}/>
                                </DataListCell>,
                                <DataListCell key="main content" className="content-cell">
                                    <div className="artifact-title">
                                        <ArtifactGroup groupId={artifact.groupId} />
                                        <ArtifactName id={artifact.id} name={artifact.name} />
                                        {
                                            statuses(artifact).map( status =>
                                                <Badge className="status-badge" key={status} isRead={true}>{status}</Badge>
                                            )
                                        }
                                    </div>
                                    <div className="artifact-description">{description(artifact)}</div>
                                </DataListCell>
                            ]}
                        />
                    </DataListItemRow>
                )
            }
        </DataList>
    );
};
