import React from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { shortenAddress } from 'utils/address';
import { formatBalance } from 'utils/token';
import WalletModal from 'components/WalletModal';
import {
    injected,
    isChainIdSupported,
    walletconnect
} from 'provider/connectors';
import Identicon from '../Identicon';
import { useStores } from '../../contexts/storesContext';
import Web3PillBox from '../Web3PillBox';


const WrongNetworkButton = styled.button`
    width: 142px;
    font-size: 0.9rem;
    justify-content: center;
    align-items: center;
    padding: 0.5rem;
    border: 1px solid var(--wrong-network-border);
    background-color: var(--wrong-network);
    color: var(--white);
    
    box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.15);
    font-size:0.9rem;
    font-weight:500;
    box-sizing: border-box;
    border-radius: 6px;
    user-select: none;
    &:hover {
        cursor: pointer;
        border: 1px solid var(--wrong-network-border-hover);
        background-color: var(--wrong-network-hover);
    }
    :focus {
        outline: none;
    }
`;

const Web3ConnectStatus = observer((props) => {

    const ConnectButton = styled.div`
        height: 38px;
        width: ${props.wide ? "unset" : "154px"}
        display: flex;
        justify-content: center;
        align-items: center;

        box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.15);
        font-size: 0.9rem;
        font-weight: 500;
        line-height: 18px;
        letter-spacing: 1px;

        cursor: pointer;
        user-select: none;
        
        padding: 0.5rem;
        border-image: initial;
        background: var(--blue-text);
        color: var(--white);
        border: 1px solid var(--active-button-border);
        box-sizing: border-box;
        border-radius: 6px;
        &:hover{
            cursor: pointer;
            background: var(--blue-onHover);
            border: 1px solid var(--blue-onHover-border);
        }

    `;
    
    const {
        root: { modalStore, transactionStore, providerStore, tokenStore },
    } = useStores();
    const {
        chainId,
        account,
        connector,
        error,
        library
    } = providerStore.getActiveWeb3React();
    let pending = undefined;
    let confirmed = undefined;

    if (chainId && account && isChainIdSupported(chainId)) {
        pending = transactionStore.getPendingTransactions(account);
        confirmed = transactionStore.getConfirmedTransactions(account);
    }

    const toggleWalletModal = () => {
        modalStore.toggleWalletModal();
    };

    // handle the logo we want to show with the account
    function getStatusIcon() {
        if (connector === injected) {
            return <Identicon />;
        } else if (connector === walletconnect) {
            return <img alt="walletconnect" src={require("assets/images/walletConnectIcon.svg")} />;
        }
    }

    function getWeb3Status() {
        console.debug('[GetWeb3Status]', {
            account,
            chainId: chainId,
            error,
        });
        // Wrong network
        if (account && chainId && !isChainIdSupported(chainId)) {
            return (
                <WrongNetworkButton onClick={toggleWalletModal}>
                    Wrong Network
                </WrongNetworkButton>
            );
        } else if (account) {
          const ETHBalance = tokenStore.getEtherBalance(account);
          return (
            <Web3PillBox onClick={toggleWalletModal}>
              <span style={{color: "#536DFE", lineHeight: "38px",padding: "0px 10px"}}>
                {ETHBalance ? formatBalance(ETHBalance) : '...'} ETH
              </span>
              <span style={{
                backgroundColor:"#F1F3F5",
                color:"#616161",
                height:"38px",
                borderRadius:"6px",
                padding: "0px 10px",
                lineHeight: "38px"
              }}>{shortenAddress(account)}</span>
            </Web3PillBox>
          );
        } else if (error) {
            return (
                <WrongNetworkButton onClick={toggleWalletModal}>
                    Wrong Network
                </WrongNetworkButton>
            );
        } else {
            return (
                <ConnectButton
                    onClick={toggleWalletModal}
                    active={true}
                    >
                    {props.text}
                </ConnectButton>
                
            );
        }
    }

    return (
        <>
            {getWeb3Status()}
            <WalletModal
                pendingTransactions={pending}
                confirmedTransactions={confirmed}
            />
        </>
    );
});

export default Web3ConnectStatus;
