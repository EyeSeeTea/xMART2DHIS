import { useLoading, useSnackbar } from "@eyeseetea/d2-ui-components";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MappingTemplate } from "../../../domain/entities/mapping-template/MappingTemplate";
import i18n from "../../../locales";
import MappingTemplateWizard from "../../components/mapping-template-wizard/MappingTemplateWizard";
import { useAppContext } from "../../contexts/app-context";

//TODO: implement confirmation dialog to back or cancel in the RouterPage
//because it's where the back button exists or to create a hook to access to back from here
export const MappingTemplateDetailPage: React.FC<MappingTemplateDetailPageProps> = ({ action }) => {
    const { compositionRoot } = useAppContext();

    const loading = useLoading();
    const navigate = useNavigate();
    const snackbar = useSnackbar();
    const { id } = useParams();

    const [mappingTemplate, setMappingTemplate] = useState(MappingTemplate.build());

    useEffect(() => {
        if (action === "edit" && !!id) {
            loading.show(true, i18n.t("Loading mapping template"));

            compositionRoot.mappingTemplates.get(id).run(
                mappingTemplate => {
                    setMappingTemplate(mappingTemplate ?? MappingTemplate.build());
                    loading.reset();
                },
                () => {
                    loading.reset();
                    snackbar.error(i18n.t("An error has ocurred loading the mapping template"));
                }
            );
        }
    }, [compositionRoot, loading, action, id, snackbar]);

    return (
        <React.Fragment>
            <MappingTemplateWizard
                mappingTemplate={mappingTemplate}
                onChange={setMappingTemplate}
                onCancel={() => navigate("/mapping-templates")}
            />
        </React.Fragment>
    );
};

export interface MappingTemplateDetailPageProps {
    action: "edit" | "new";
}
