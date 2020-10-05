// Libraries
import jazzicon from 'jazzicon';
import { ethers, utils } from 'ethers';
import { BigNumber } from 'utils/bignumber';
import { SUPPORTED_THEMES } from '../theme';

// Utils
export const MAX_GAS = utils.bigNumberify('0xffffffff');
export const MAX_UINT = utils.bigNumberify(ethers.constants.MaxUint256);
export const DEFAULT_TOKEN_DECIMALS = 18;

export function bnum(
    val: string | number | utils.BigNumber | BigNumber
): BigNumber {
    return new BigNumber(val.toString());
}

export function scale(input: BigNumber, decimalPlaces: number): BigNumber {
    const scalePow = new BigNumber(decimalPlaces.toString());
    const scaleMul = new BigNumber(10).pow(scalePow);
    return input.times(scaleMul);
}

export function setPropertyToMaxUintIfEmpty(value?): string {
    if (!value || value === 0 || value === '') {
        value = MAX_UINT.toString();
    }
    return value;
}

export function setPropertyToZeroIfEmpty(value?): string {
    if (!value || value === '') {
        value = '0';
    }
    return value;
}

export function hasMaxApproval(amount: BigNumber): boolean {
    return amount.gte(bnum(MAX_UINT.div(2).toString()));
}

export function isEmpty(str: string): boolean {
    return !str || 0 === str.length;
}

export function roundValue(value, decimals = 4): string {
    const decimalPoint = value.indexOf('.');
    if (decimalPoint === -1) {
        return value;
    }
    return value.slice(0, decimalPoint + decimals + 1);
}

export function str(value: any): string {
    return value.toString();
}

export function getQueryParam(windowLocation, name) {
    var q = windowLocation.search.match(
        new RegExp('[?&]' + name + '=([^&#?]*)')
    );
    return q && q[1];
}

export function checkSupportedTheme(themeName) {
    if (themeName && themeName.toUpperCase() in SUPPORTED_THEMES) {
        return themeName.toUpperCase();
    }
    return null;
}

export const copyToClipboard = (e) => {
    const value = e.target.title.replace(',', '');
    var aux = document.createElement('input');
    aux.setAttribute('value', value);
    document.body.appendChild(aux);
    aux.select();
    document.execCommand('copy');
    document.body.removeChild(aux);
    alert(`Value: "${value}" copied to clipboard`);
};

export const generateIcon = (address) => {
    return jazzicon(28, address.substr(0, 10));
};
