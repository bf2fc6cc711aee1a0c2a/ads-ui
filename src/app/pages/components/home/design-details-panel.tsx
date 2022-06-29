import React, {FunctionComponent, useState} from "react";
import "./design-details-panel.css";
import {Design} from "@app/models";
import {Tab, Tabs, TabTitleText} from "@patternfly/react-core";
import {ArtifactTypeIcon, DateTime, DesignDescription} from "@app/components";
import {DesignEvents, DesignHistory, DesignOriginLabel} from "@app/pages/components";

/**
 * Properties
 */
export type DesignDetailsPanelProps = {
    design: Design | undefined;
};

/**
 * Details panel with metadata and history about a single selected design.
 */
export const DesignDetailsPanel: FunctionComponent<DesignDetailsPanelProps> = ({design}: DesignDetailsPanelProps) => {

    const [activeTabKey, setActiveTabKey] = useState<string>("details");

    return (
        <React.Fragment>
            <Tabs
                activeKey={activeTabKey}
                onSelect={(event, eventKey) => {setActiveTabKey(eventKey as string)}}
                aria-label="Design panel detail tabs"
            >
                <Tab eventKey="details" title={<TabTitleText>Details</TabTitleText>}>
                    <div className="design-details-grid">
                        <div className="design-details-label">Description</div>
                        <DesignDescription className="design-details-value" description={design?.summary} />

                        <div className="design-details-label">Type</div>
                        <div className="design-details-value">
                            <ArtifactTypeIcon type={design?.type as string} isShowLabel={true} isShowIcon={false} />
                        </div>

                        <div className="design-details-label">Time created</div>
                        <div className="design-details-value"><DateTime date={design?.createdOn} /></div>

                        <div className="design-details-label">Time updated</div>
                        <div className="design-details-value"><DateTime date={design?.modifiedOn} /></div>

                        <div className="design-details-label">Origin</div>
                        <div className="design-details-value">
                            <DesignOriginLabel design={design} />
                        </div>
                    </div>
                </Tab>
                <Tab eventKey="events" title={<TabTitleText>Events</TabTitleText>}>
                    <DesignEvents design={design as Design} />
                </Tab>
                <Tab eventKey="history" title={<TabTitleText>History</TabTitleText>}>
                    <DesignHistory design={design as Design} />
                </Tab>
            </Tabs>
        </React.Fragment>
    );
};
