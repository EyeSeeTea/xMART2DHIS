import _ from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { SchedulerExecution } from "../../../domain/entities/scheduler/SchedulerExecution";
import i18n from "../../../locales";
import { useAppContext } from "../../contexts/app-context";
import { useCallbackEffect } from "../../hooks/useCallbackEffect";

export interface SchedulerInfoProps {
    onSchedulerRun?: (timestamp: string) => void;
}

export const SchedulerInfo: React.FC<SchedulerInfoProps> = React.memo(props => {
    const { onSchedulerRun } = props;
    const { compositionRoot } = useAppContext();
    const [messages, setMessages] = useState<string[]>([]);

    const getSchedulerInfo = useCallbackEffect(
        useCallback(() => {
            return compositionRoot.scheduler.getLastExecution().run(
                execution => {
                    console.log(execution)
                    const timestamp = execution?.lastExecution?.toISOString() ?? "";
                    if (onSchedulerRun) onSchedulerRun(timestamp);
                    return setMessages(formatSchedulerInfo(execution));
                },
                msg => setMessages([msg])
            );
        }, [compositionRoot, onSchedulerRun])
    );

    useEffect(() => {
        getSchedulerInfo();
        const intervalId = setInterval(() => getSchedulerInfo(), 60 * 1000);
        return () => clearInterval(intervalId);
    }, [getSchedulerInfo, setMessages]);

    return (
        <SchedulerContainer>
            {messages.length > 0 && <b>{i18n.t("Scheduler")}</b>}
            {messages.map((msg, idx) => (
                <SchedulerInfoLine key={idx}>{msg}</SchedulerInfoLine>
            ))}
        </SchedulerContainer>
    );
});

const SchedulerContainer = styled.div`
    margin: 0 20px;
`;

const SchedulerInfoLine = styled.div``;

function formatSchedulerInfo(info?: SchedulerExecution): string[] {
    return _.compact([
        info?.lastExecution
            ? [
                  `${i18n.t("Last")}:`,
                  formatDateTime(info.lastExecution),
                  `(${info.lastExecutionDuration} ${i18n.t("seconds")})`,
              ].join(" ")
            : undefined,
        info?.nextExecution
            ? [
                  `${i18n.t("Next")}:`,
                  info.nextExecution < new Date() ? i18n.t("Script not running") : formatDateTime(info.nextExecution),
              ].join(" ")
            : undefined,
    ]);
}

function formatDateTime(datetime: Date): string {
    const date = datetime.toLocaleDateString([], { day: "2-digit", month: "2-digit", year: "numeric" });
    const time = datetime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return `${date} ${time}`;
}
