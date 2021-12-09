import i18n from "@dhis2/d2-i18n";
import { FormControl, InputLabel, MenuItem, Select } from "@material-ui/core";
import _ from "lodash";
import styled from "styled-components";

export interface DropdownOption<T extends string | undefined = string | undefined> {
    id: T;
    name: string;
}

interface DropdownProps<T extends string | undefined = string | undefined> {
    items: DropdownOption<T>[];
    value: T;
    label?: string;
    onChange?: (event: React.ChangeEvent<{ name?: string; value: unknown }>) => void;
    onValueChange?: (value: T) => void;
    hideEmpty?: boolean;
    emptyLabel?: string;
    disabled?: boolean;
}

const StyledFormControl = styled(FormControl)`
    min-width: 200px;
    margin-top: -8px;
    margin-left: 10px;
`;

export function Dropdown<T extends string | undefined = string | undefined>({
    items,
    value,
    onChange = _.noop,
    onValueChange = _.noop,
    label,
    hideEmpty = false,
    emptyLabel,
    disabled = false,
}: DropdownProps<T>) {
    return (
        <StyledFormControl>
            {label && <InputLabel>{label}</InputLabel>}
            <Select
                key={`dropdown-select-${label}`}
                value={value}
                onChange={e => {
                    onChange(e);
                    onValueChange(e.target.value as T);
                }}
                MenuProps={{
                    getContentAnchorEl: null,
                    anchorOrigin: {
                        vertical: "bottom",
                        horizontal: "left",
                    },
                }}
                disabled={disabled}
            >
                {!hideEmpty && <MenuItem value={""}>{emptyLabel ?? i18n.t("<No value>")}</MenuItem>}
                {items.map(element => (
                    <MenuItem key={`element-${element.id}`} value={element.id}>
                        {element.name}
                    </MenuItem>
                ))}
            </Select>
        </StyledFormControl>
    );
}

export default Dropdown;
