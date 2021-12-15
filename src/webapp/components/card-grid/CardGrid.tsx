import React from "react";
import styled from "styled-components";
import { MenuCard, MenuCardProps } from "./MenuCard";

export const CardGrid: React.FC<CardGridProps> = ({ cards }) => {
    return (
        <Container>
            {cards.map(({ key, title, children }) => (
                <div key={key}>
                    {!!title && <Title>{title}</Title>}

                    {children.map(props => (
                        <MenuCard key={props.name} {...props} />
                    ))}
                </div>
            ))}
        </Container>
    );
};

export interface CardGridProps {
    cards: Card[];
    title?: string;
    onBackClick?: () => void;
}

export interface Card {
    title?: string;
    key: string;
    children: MenuCardProps[];
}

const Container = styled.div`
    margin-left: 30px;
    display: flex;
    flex-direction: column;
`;

const Title = styled.h1`
    font-size: 24px;
    font-weight: 300;
    color: rgba(0, 0, 0, 0.87);
    padding: 15px 0px 15px;
    margin: 0;
`;
