import React, { useCallback, useMemo } from "react";
import { DataSyncPeriod } from "../../../../domain/entities/metadata/DataSyncPeriod";
import PeriodSelection, { ObjectWithPeriod } from "../../period-selection/PeriodSelection";
import { ActionWizardStepProps } from "../ActionWizard";

export const PeriodSelectionStep: React.FC<ActionWizardStepProps> = ({ action, onChange }) => {
    const updatePeriod = useCallback(
        (period: DataSyncPeriod) => {
            onChange(action.update({ period, startDate: undefined, endDate: undefined }));
        },
        [onChange, action]
    );

    const updateStartDate = useCallback(
        (date: Date | null) => {
            onChange(action.update({ startDate: date ?? undefined }));
        },
        [onChange, action]
    );

    const updateEndDate = useCallback(
        (date: Date | null) => {
            onChange(action.update({ endDate: date ?? undefined }));
        },
        [onChange, action]
    );

    const onFieldChange = useCallback(
        (field: keyof ObjectWithPeriod, value: ObjectWithPeriod[keyof ObjectWithPeriod]) => {
            switch (field) {
                case "period":
                    return updatePeriod(value as ObjectWithPeriod["period"]);
                case "startDate":
                    return updateStartDate((value as ObjectWithPeriod["startDate"]) || null);
                case "endDate":
                    return updateEndDate((value as ObjectWithPeriod["endDate"]) || null);
            }
        },
        [updatePeriod, updateStartDate, updateEndDate]
    );

    const objectWithPeriod: ObjectWithPeriod = useMemo(() => {
        return {
            period: action.period,
            startDate: action.startDate || undefined,
            endDate: action.endDate || undefined,
        };
    }, [action]);

    return <PeriodSelection objectWithPeriod={objectWithPeriod} onFieldChange={onFieldChange} />;
   
};
