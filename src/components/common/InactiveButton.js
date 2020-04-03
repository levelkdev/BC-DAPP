import React from 'react';
import styled from 'styled-components';

const Button = styled.div`
    background-color: white;
    border: 1px solid var(--pending-text-gray);
    border-radius: 4px;
    color: var(--pending-text-gray);
    height: 34px;
    line-height: 34px;
    text-align: center;
    text-transform: uppercase;
`;
const InactiveButton = ({ children, onClick }) => {
    return <Button onClick={onClick}>{children}</Button>;
};

export default InactiveButton;
