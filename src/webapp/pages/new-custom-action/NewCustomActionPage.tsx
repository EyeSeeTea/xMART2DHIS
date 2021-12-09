import { Button } from "@dhis2/ui";
import Editor, { Monaco } from "@monaco-editor/react";
import _ from "lodash";
import React, { useCallback, useState } from "react";
import ReactJson from "react-json-view";
import styled from "styled-components";
import * as ts from "typescript";
import { Constants } from "../../../data/Constants";
import { AzureMSALRepository } from "../../../data/repositories/AzureMSALRepository";
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
        // eslint-disable-next-line no-eval
        const runtime = eval(jsCode);

        const azureRepository = new AzureMSALRepository(Constants.TENANT_ID, Constants.CLIENT_ID);
        const martRepository = new XMartDefaultRepository(azureRepository);
        const instanceRepository = new InstanceD2ApiRepository(instance);
        const result = await runtime.execute(martRepository, instanceRepository);

        setResult(_.cloneDeep(result));
    }, [value, instance]);

    return (
        <React.Fragment>
            <MonacoEditor value={value} onChange={setValue} />

            <Center style={{ marginTop: 10 }}>
                <Button type="button" onClick={execute}>
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
