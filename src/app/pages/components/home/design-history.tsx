import React, { FunctionComponent, useEffect, useState } from "react";
import "./design-history.css";
import { Design, DesignEvent } from "@app/models";
import { DesignsService, useDesignsService } from "@app/services";
import { DateTime, IfNotEmpty, IsLoading } from "@app/components";
import { DesignEventType } from "@app/pages/components";

/**
 * Properties
 */
export type DesignHistoryProps = {
    design: Design;
};

export const DesignHistory: FunctionComponent<DesignHistoryProps> = ({design}: DesignHistoryProps) => {
    const [isLoading, setLoading] = useState<boolean>(false);
    const [events, setEvents] = useState<DesignEvent[]>();

    const designsService: DesignsService = useDesignsService();

    useEffect(() => {
        if (design) {
            designsService.getEvents(design.id).then(events => {
                setEvents(events);
                setLoading(false);
            }).catch(error => {
                // TODO error handling!
            });
        }
    }, [design]);
    return (
        <IsLoading condition={isLoading}>
            <IfNotEmpty collection={events}>
                <div className="design-history">
                    {
                        events?.map((event, idx) => (
                            <React.Fragment key={idx}>
                                <div key={`${idx}-type`} className="event-type"><DesignEventType event={event} /></div>
                                <div key={`${idx}-time`} className="event-time"><DateTime date={event.on} /></div>
                            </React.Fragment>
                        ))
                    }
                </div>
            </IfNotEmpty>
        </IsLoading>
    );
};
