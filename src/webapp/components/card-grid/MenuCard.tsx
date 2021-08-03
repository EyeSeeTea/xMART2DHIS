import {
    Card as MUICard,
    CardActions as MUICardActions,
    CardContent as MUICardContent,
    CardHeader as MUICardHeader,
    IconButton,
    Tooltip,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import ViewListIcon from "@material-ui/icons/ViewList";
import React from "react";
import styled from "styled-components";
import i18n from "../../../locales";

export const MenuCard: React.FC<MenuCardProps> = ({ name, description, addAction, listAction = () => {} }) => {
    return (
        <Card>
            <Header onClick={listAction} title={name} />

            <Content>{description}</Content>

            <Actions disableSpacing>
                {addAction && (
                    <Tooltip title={i18n.t("Add")} placement="top">
                        <IconButton key="add" onClick={addAction}>
                            <AddIcon />
                        </IconButton>
                    </Tooltip>
                )}

                {listAction && (
                    <Tooltip title={i18n.t("List")} placement="top">
                        <IconButton key="list" onClick={listAction}>
                            <ViewListIcon />
                        </IconButton>
                    </Tooltip>
                )}
            </Actions>
        </Card>
    );
};

export interface MenuCardProps {
    name: string;
    description?: string;
    addAction?: () => void;
    listAction?: () => void;
}

const Card = styled(MUICard)`
    padding: 0;
    margin: 0.5rem;
    float: left;
    width: 230px;
`;

const Content = styled(MUICardContent)`
    height: 120px;
    padding: 0.5rem 1rem;
    font-size: 14px;
`;

const Actions = styled(MUICardActions)`
    margin-left: auto;
`;

const Header = styled(MUICardHeader)`
    padding: 1rem;
    height: auto;
    border-bottom: 1px solid #ddd;
    cursor: pointer;
    font-size: 15px;
    font-weight: 500;
`;
