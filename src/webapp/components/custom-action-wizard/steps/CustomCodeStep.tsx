import Editor, { Monaco } from "@monaco-editor/react";
import React from "react";
import { actionGlobals } from "../../../../data/utils/action-types";
import { CustomActionWizardStepProps } from "../CustomActionWizard";

export const CustomCodeStep = ({ action, onChange }: CustomActionWizardStepProps) => {
    const onChangeField = (value: string | undefined) => onChange(action.update({ customCode: value }));

    return (
        <React.Fragment>
            <MonacoEditor value={action.customCode} onChange={onChangeField} />
        </React.Fragment>
    );
};

const MonacoEditor: React.FC<{ value: string; onChange: (value: string | undefined) => void }> = ({
    value,
    onChange,
}) => {
    const handleEditorDidMount = (monaco: Monaco) => {
        monaco.languages.typescript.typescriptDefaults.addExtraLib(actionGlobals, "globals.d.ts");
    };

    return (
        <Editor
            height="40vh"
            defaultLanguage="typescript"
            onChange={onChange}
            value={value}
            options={{ minimap: { enabled: false } }}
            beforeMount={handleEditorDidMount}
        />
    );
};
