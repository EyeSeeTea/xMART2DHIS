import Editor, { Monaco } from "@monaco-editor/react";
import React, { useState } from "react";

export const NewActionPage: React.FC = () => {
    const [value = "", setValue] = useState<string | undefined>(template);

    return (
        <React.Fragment>
            <MonacoEditor value={value} onChange={setValue} />
        </React.Fragment>
    );
};

const globals = ``;

const template = `async function execute(martRepository: XMartRepository, instanceRepository: InstanceRepository): Promise<void> {}
`;

const MonacoEditor: React.FC<{ value: string; onChange: (value: string | undefined) => void }> = ({
    value,
    onChange,
}) => {
    const handleEditorDidMount = (monaco: Monaco) => {
        monaco.languages.typescript.typescriptDefaults.addExtraLib(globals, "globals.d.ts");
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
