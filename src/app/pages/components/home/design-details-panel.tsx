import React, {FunctionComponent, useState} from "react";
import "./design-details-panel.css";
import {Design} from "@app/models";
import {Flex, FlexItem, Form, FormGroup, Tab, Tabs, TabTitleText} from "@patternfly/react-core";
import {ArtifactTypeIcon} from "@app/components";
import Moment from "react-moment";
import {DesignHistory} from "@app/pages/components";

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
                        <div className="design-details-value">{design?.summary}</div>

                        <div className="design-details-label">Type</div>
                        <div className="design-details-value">
                            <ArtifactTypeIcon type={design?.type as string} isShowLabel={true} isShowIcon={false} />
                        </div>

                        <div className="design-details-label">Created</div>
                        <div className="design-details-value"><Moment date={design?.createdOn} fromNow={true} /></div>

                        <div className="design-details-label">Last updated</div>
                        <div className="design-details-value"><Moment date={design?.modifiedOn} fromNow={true} /></div>
                    </div>
                </Tab>
                <Tab eventKey="history" title={<TabTitleText>History</TabTitleText>}>
                    <DesignHistory design={design as Design} />
                </Tab>
                <Tab eventKey="events" title={<TabTitleText>Events</TabTitleText>}>
                    Events
                </Tab>
            </Tabs>
        </React.Fragment>
    );
};
