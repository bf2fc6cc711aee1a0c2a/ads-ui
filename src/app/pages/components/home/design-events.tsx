import React, {FunctionComponent, useEffect, useState} from "react";
import "./design-events.css";
import {Design, DesignEvent} from "@app/models";
import {DesignsService, useDesignsService} from "@app/services";
import Moment from "react-moment";
import {ArtifactTypeIcon, If, IfNotEmpty, IsLoading} from "@app/components";
import {DesignEventType, DesignOriginLabel} from "@app/pages/components";
import {hasOrigin} from "@app/utils";
import {Divider} from "@patternfly/react-core";


export type DesignEventsProps = {
    design: Design|undefined;
};


export const DesignEvents: FunctionComponent<DesignEventsProps> = ({design}: DesignEventsProps) => {
    const [isLoading, setLoading] = useState<boolean>(false);
    const [exports, setExports] = useState<DesignEvent[]>();

    const designsService: DesignsService = useDesignsService();

    const originGroupId = (): string => {
        return design?.origin.rhosr?.groupId || "default";
    };
    const originArtifactId = (): string => {
        return design?.origin.rhosr?.artifactId || "Unknown";
    };
    const originVersion = (): string => {
        return design?.origin.rhosr?.version || "latest";
    };
    const originFilename = (): string => {
        return design?.origin.file?.fileName || "";
    };
    const originUrl = (): string => {
        return design?.origin.url?.url || "";
    };

    useEffect(() => {
        if (design) {
            designsService.getEvents(design.id).then(events => {
                setExports(events?.filter(event => event.type === "download" || event.type === "register"));
                setLoading(false);
            }).catch(error => {
                // TODO error handling!
            });
        }
    }, [design]);
    return (
        <React.Fragment>
            <div className="design-events-origin">
                <div className="design-events-origin-label">Origin</div>
                <div className="design-events-origin-value">
                    <DesignOriginLabel design={design} />
                </div>

                <div className="design-events-origin-label">Time created</div>
                <div className="design-events-origin-value"><Moment date={design?.createdOn} fromNow={true} /></div>

                <If condition={hasOrigin(design, "rhosr")}>
                    <div className="design-events-origin-label">Group ID</div>
                    <div className="design-events-origin-value">{originGroupId()}</div>

                    <div className="design-events-origin-label">Artifact ID</div>
                    <div className="design-events-origin-value">{originArtifactId()}</div>

                    <div className="design-events-origin-label">Version</div>
                    <div className="design-events-origin-value">{originVersion()}</div>
                </If>

                <If condition={hasOrigin(design, "file")}>
                    <div className="design-events-origin-label">Filename</div>
                    <div className="design-events-origin-value">{originFilename()}</div>
                </If>

                <If condition={hasOrigin(design, "url")}>
                    <div className="design-events-origin-label">URL</div>
                    <div className="design-events-origin-value">{originUrl()}</div>
                </If>
            </div>
            <Divider className="design-events-divider" />
            <IsLoading condition={isLoading}>
                <div className="design-events-origin-exports">
                    <div className="design-events-origin-exports-label">Exported to</div>
                    <div></div>

                    <IfNotEmpty collection={exports}>
                        {
                            exports?.map((event, idx) => (
                                <React.Fragment key={idx}>
                                    <div key={`${idx}-type`} className="design-events-origin-exports-item"><DesignEventType event={event} variant="short" /></div>
                                    <div key={`${idx}-time`} className="design-events-origin-exports-time"><Moment date={event.on} format="MMMM DD, YYYY h:mma" /></div>
                                </React.Fragment>
                            ))
                        }
                    </IfNotEmpty>
                </div>
            </IsLoading>
        </React.Fragment>
    );
};
