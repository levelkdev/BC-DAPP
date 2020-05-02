import React from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import ActiveButton from '../common/ActiveButton';
import InactiveButton from '../common/InactiveButton';
import store from '../../stores/Root';
import { useStores } from '../../contexts/storesContext';
import { formatBalance, formatNumberValue } from '../../utils/token';

const FormWrapper = styled.div`
    padding-top: 24px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
`;

const InfoRow = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    line-height: 20px;
    color: var(--dark-text-gray);
    margin-bottom: 12px;
`;

const FormInfoText = styled.div`
    color: var(--light-text-gray);
`;

const Confirmed = styled.div`
    align-items: center;
    font-size: 15px;
    line-height: 20px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    letter-spacing: 0.4px;
    color: var(--turquois-text);
    margin-bottom: 28px;
`;

const CheckboxContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    height: 20px;
    width: 20px;
`;

const SellConfirmed = observer((props) => {
    const {
        root: { datStore, tradingStore, configStore },
    } = useStores();

    const sellText = datStore.isInitPhase(configStore.getDXDTokenAddress()) ? "Withdraw" : "Sell";

    const {sellPrice, rewardForSell, sellAmount} = tradingStore.previousSell;

    const Button = ({ active, children, onClick }) => {
        if (active === true) {
            return (
                <ActiveButton onClick={onClick}>{children}</ActiveButton>
            );
        } else {
            return (
                <InactiveButton>{children}</InactiveButton>
            );
        }
    };

    return (
        <FormWrapper>
            <InfoRow>
                <FormInfoText>Price</FormInfoText>
                <div>
                    {formatNumberValue(sellPrice)} {configStore.getCollateralType()}
                </div>
            </InfoRow>
            <InfoRow>
                <FormInfoText>Receive Amount</FormInfoText>
                <div>
                    {formatBalance(rewardForSell)} {configStore.getCollateralType()}
                </div>
            </InfoRow>
            <InfoRow>
                <FormInfoText>Sell Amount</FormInfoText>
                <div>{formatBalance(sellAmount)} DXD</div>
            </InfoRow>
            <Confirmed>
                Confirmed
                <CheckboxContainer>
                    <img src="tick.svg"/>
                </CheckboxContainer>
            </Confirmed>
            <Button
                active={true}
                onClick={() => {
                    tradingStore.resetSellForm();
                }}
            >
                {sellText} Again
            </Button>
        </FormWrapper>
    );
});

export default SellConfirmed;
