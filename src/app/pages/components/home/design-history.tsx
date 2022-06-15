import React, {FunctionComponent, useEffect, useState} from "react";
import "./design-history.css";
import {Design, DesignEvent} from "@app/models";
import {DesignsService, useDesignsService} from "@app/services";
import Moment from "react-moment";
import {IfNotEmpty, IsLoading} from "@app/components";

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
                        events?.map(event => (
                            <div className="design-history-item">
                                <span>{event.type}</span>
                                <span> at </span>
                                <Moment date={event.on} fromNow={true} />
                            </div>
                        ))
                    }
                </div>
            </IfNotEmpty>
        </IsLoading>
    );
};
