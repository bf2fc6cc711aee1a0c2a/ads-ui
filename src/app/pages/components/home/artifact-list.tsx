import React, {FunctionComponent, useState} from "react";
import "./artifact-list.css";
import {CreateDraftContent, SearchedArtifact, SearchedVersion} from "@app/models";
import {ArtifactListItem} from "@app/pages/components";

/**
 * Properties
 */
export type ArtifactListProps = {
    artifacts?: SearchedArtifact[];
    fetchArtifactVersions: (artifact: SearchedArtifact) => Promise<SearchedVersion[]>;
    fetchArtifactContent: (artifact: SearchedArtifact, version?: SearchedVersion) => Promise<string>;
    onArtifactSelected: (artifact?: SearchedArtifact, content?: CreateDraftContent) => void;
}

/**
 * A list of artifacts in a RHOSR instance.
 */
export const ArtifactList: FunctionComponent<ArtifactListProps> = (
    {artifacts, fetchArtifactVersions, fetchArtifactContent, onArtifactSelected}: ArtifactListProps) => {

    const [selectedArtifact, setSelectedArtifact] = useState<SearchedArtifact>();

    const onArtifactSelectedInternal = (artifact: SearchedArtifact): void => {
        console.debug("[ArtifactList] Artifact selected: ", artifact);
        setSelectedArtifact(artifact);
    };

    const onArtifactUnselectedInternal = (artifact: SearchedArtifact): void => {
        console.debug("[ArtifactList] Artifact unselected: ", artifact);
        setSelectedArtifact(undefined);
        onArtifactSelected(undefined, undefined);
    };

    const onArtifactLoaded = (artifact: SearchedArtifact, content: CreateDraftContent): void => {
        console.debug("[ArtifactList] Artifact loaded: ", artifact);
        console.debug("[ArtifactList] Selected Artifact: ", selectedArtifact);
        if (artifact === selectedArtifact) {
            onArtifactSelected(artifact, content);
        }
    };

    return (
        <div className="artifact-list">
            {
                artifacts?.map( (artifact, idx) =>
                    <ArtifactListItem artifact={artifact} key={idx}
                                      onSelected={onArtifactSelectedInternal}
                                      onUnselected={onArtifactUnselectedInternal}
                                      fetchArtifactVersions={fetchArtifactVersions}
                                      fetchArtifactContent={fetchArtifactContent}
                                      onArtifactLoaded={onArtifactLoaded}
                                      isSelected={selectedArtifact === artifact} />
                )
            }
        </div>
    );
};
