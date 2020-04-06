import React from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import ActiveButton from '../common/ActiveButton';
import InactiveButton from '../common/InactiveButton';
import { DATinfo } from '../../blockchainInfo.json';
import { useStores } from '../../contexts/storesContext';
import {
    denormalizeBalance,
    formatBalance,
    normalizeBalance,
} from '../../utils/token';
import { bnum, str } from '../../utils/helpers';
import { TXEvents } from '../../types';
import { TransactionState } from '../../stores/TradingForm';
import { validateTokenValue, ValidationStatus } from '../../utils/validators';

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

const FormContent = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    color: rgba(48, 79, 254, 0.2);
    border: 1px solid rgba(48, 79, 254, 0.2);
    border-radius: 4px;
    height: 34px;
    line-height: 34px;
    margin-top: 12px;
    margin-bottom: 32px;
    font-weight: 600;
    font-size: 15px;
    input,
    input:focus {
        border: none;
        font-size: inherit;
        outline: none;
        ::placeholder {
            color: rgba(48, 79, 254, 0.4);
        }
    }
`;

const InputColumn = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
`;

const ErrorValidation = styled.div`
    font-size: 14px;
    display: flex;
    flex-direction: row;
    position: absolute;
    padding-top: 40px;
    align-self: flex-end;
    color: red;
`;

const DisconnectedError = styled.div`
    font-size: 12px;
    display: flex;
    flex-direction: row;
    position: absolute;
    padding-top: 40px;
    text-align: right;
    font-weight: 600;
    line-height: 14px;
    letter-spacing: 0.2px;
    align-self: flex-end;
    color: #E57373;
`;

const BuyInput = observer((props) => {
    const {
        root: { datStore, tradingStore, configStore, providerStore },
    } = useStores();

    const { account } = providerStore.getActiveWeb3React();
    const { infotext } = props;
    const price = tradingStore.formatPrice();
    const priceToBuy = tradingStore.formatPriceToBuy();
    let hasError = false;
    let disconnectedError = (tradingStore.buyAmount > 0) ? (account == null) ? true : false : false;

    const Button = ({ active, children, onClick }) => {
        if (active === true) {
            return <ActiveButton onClick={onClick}>{children}</ActiveButton>;
        } else {
            return (
                <InactiveButton>{children}</InactiveButton>
            );
        }
    };

    const checkActive = () => {
        return tradingStore.buyAmount > 0 && !!account && !hasError;
    };

    const validateNumber = async (value) => {
        disconnectedError = (account == null) ? true : false;
        tradingStore.setBuyAmount(value);
        hasError = !(value > 0);

        const minValue = normalizeBalance(
            datStore.getMinInvestment(configStore.activeDatAddress)
        );
        const status = validateTokenValue(value, {
            minValue,
        });

        if (status === ValidationStatus.VALID) {
            const weiValue = denormalizeBalance(value);

            const buyReturn = await datStore.fetchBuyReturn(
                configStore.activeDatAddress,
                weiValue
            );

            tradingStore.handleBuyReturn(buyReturn);
        } else {
            tradingStore.setPayAmount(bnum(0));
            tradingStore.setPrice(bnum(0));
        }
    };

    return (
        <FormWrapper>
            <InfoRow>
                <FormInfoText>Price</FormInfoText>
                <div>
                    {price} {DATinfo.collateralType}
                </div>
            </InfoRow>
            <InfoRow>
                <FormInfoText>{infotext}</FormInfoText>
                <div>{formatBalance(tradingStore.payAmount)} DXD</div>
            </InfoRow>
            <InputColumn>
                <FormContent>
                    <input
                        className="form-vivid-blue"
                        type="text"
                        placeholder="0"
                        value={tradingStore.buyAmount}
                        onChange={(e) => validateNumber(e.target.value)}
                    />
                    <div>ETH</div>
                </FormContent>
                {hasError ? (
                    <ErrorValidation>
                        <p>Must be a positive number</p>
                    </ErrorValidation>
                ) : (
                    <></>
                )}
                {disconnectedError ? (
                    <DisconnectedError>
                        <p>Connect Wallet to proceed with order</p>
                    </DisconnectedError>
                ) : (
                    <></>
                )}
            </InputColumn>
            <Button
                active={checkActive()}
                onClick={() => {
                    tradingStore.buyingState = TransactionState.SIGNING_TX;
                    datStore
                        .buy(
                            configStore.activeDatAddress,
                            account,
                            denormalizeBalance(str(tradingStore.buyAmount)),
                            bnum(1)
                        )
                        .on(TXEvents.TX_HASH, (hash) => {
                            tradingStore.buyingState =
                                TransactionState.UNCONFIRMED;
                        })
                        .on(TXEvents.RECEIPT, (receipt) => {
                            tradingStore.buyingState =
                                TransactionState.CONFIRMED;
                        })
                        .on(TXEvents.TX_ERROR, (error) => {
                            tradingStore.buyingState = TransactionState.NONE;
                        });
                }}
            >
                Buy DXD
            </Button>
        </FormWrapper>
    );
});

export default BuyInput;
