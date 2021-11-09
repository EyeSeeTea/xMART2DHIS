import { Button } from "@material-ui/core";
import Editor, { Monaco } from "@monaco-editor/react";
import _ from "lodash";
import React, { useCallback, useState } from "react";
import ReactJson from "react-json-view";
import styled from "styled-components";
import * as ts from "typescript";
import { InstanceD2ApiRepository } from "../../../data/repositories/InstanceD2ApiRepository";
import { XMartDefaultRepository } from "../../../data/repositories/XMartDefaultRepository";
import { actionGlobals } from "../../../data/utils/action-types";
import i18n from "../../../locales";
import { useAppContext } from "../../contexts/app-context";

export const NewActionPage: React.FC = () => {
    const { instance } = useAppContext();

    const [value = "", setValue] = useState<string | undefined>(template);
    const [result, setResult] = useState<any>();

    const execute = useCallback(async () => {
        const jsCode = ts.transpile([`"use strict";`, value, "({ execute })"].join("\n"));
        const runtime = eval(jsCode);

        const martRepository = new XMartDefaultRepository();
        const instanceRepository = new InstanceD2ApiRepository(instance);
        const result = await runtime.execute(martRepository, instanceRepository);

        setResult(_.cloneDeep(result));
    }, [value, instance]);

    return (
        <React.Fragment>
            <MonacoEditor value={value} onChange={setValue} />

            <Center>
                <Button variant="contained" onClick={execute} style={{ margin: "10px" }}>
                    {i18n.t("Run")}
                </Button>
            </Center>

            <FixedSize>{result ? <ReactJson src={result} collapsed={1} enableClipboard={false} /> : null}</FixedSize>
        </React.Fragment>
    );
};

const Center = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`;

const FixedSize = styled.div`
    overflow-y: auto;
    height: 400px;
`;

const template = `async function execute(martRepository: XMartRepository, instanceRepository: InstanceRepository): Promise<any> {
    
}
`;

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
