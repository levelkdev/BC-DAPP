import React from 'react';
import styled from 'styled-components';
import { Line } from 'react-chartjs-2';
import { observer } from 'mobx-react';
import { useStores } from '../contexts/storesContext';

const ChartPanelWrapper = styled.div`
    width: 610px;
    background-color: white;
    border: 1px solid var(--medium-gray);
    border-radius: 4px;
`;

const ChartHeaderWrapper = styled.div`
    display: flex;
    padding: 15px;
    border-bottom: 1px solid var(--line-gray);
`;

const ChartBox = styled.div`
    display: flex;
    justify-content: center;
    width: calc(100% / 3);
`;

const ChartHeaderFullElement = styled.div`
    color: var(--dark-text-gray);
    padding: 10px;
`;

const ChartHeaderTopElement = styled.div`
    font-size: 14px;
    font-weight: 500;
    color: var(--light-text-gray);
`;

const ChartHeaderBottomElement = styled.div`
    font-size: 17px;
    margin-top: 10px;
`;

const ChartWrapper = styled.div`
    height: 250px;
    padding: 20px 20px 0px 20px;
`;

const BondingCurveChart = observer(({}) => {
    const {
        root: { tradingStore, providerStore, tokenStore, configStore, datStore },
    } = useStores();

    const totalSupply = tokenStore.getTotalSupply(configStore.getDXDTokenAddress());
    // const buySlope = datStore.getBuySlope(configStore.activeDatAddress);
    // const sellSlope = datStore.getSellSlope(configStore.activeDatAddress);
    // const initGoal = datStore.getInitGoal(configStore.activeDatAddress);

    /*
        Draw a strait line for the inital goal. The PRICE for this is the slope for total supply 0
        We may have to hardcode this value...

        It's a slope but I DON"T understand because it's 1 / 10^18!!!! And it seems to be about 1/3 of tokens.
     */

    // const allDataFetched = !!totalSupply && !!buySlope && !! sellSlope;

    const options = {
        maintainAspectRatio: false,
        legend: {
            display: false,
        },
        scales: {
            xAxes: [
                {
                    type: 'linear',
                    display: true,
                    gridLines: {
                        display: false,
                    },
                    scaleLabel: {
                        display: true,
                        labelString: '',
                    },
                    ticks: {
                        major: {
                            fontStyle: 'bold',
                            fontColor: '#BDBDBD',
                        },
                    },
                },
            ],
            yAxes: [
                {
                    display: true,
                    gridLines: {
                        display: true,
                        color: '#E1E3E7',
                    },
                    position: 'right',
                    ticks: {
                        callback: function (value, index, values) {
                            return value + ' DAI';
                        },
                    },
                    scaleLabel: {
                        display: true,
                        labelString: '',
                    },
                },
            ],
        },
    };

    const data = {
        datasets: [
            {
                label: 'Check out the data',
                fill: false,
                data: [
                    { x: 1, y: 1 },
                    { x: 2, y: 1 },
                    { x: 3, y: 1 },
                    { x: 4, y: 3 },
                ],
                borderWidth: 2,
                pointRadius: 0,
                borderColor: '#5b76fa',
                lineTension: 0
            },
            {
                label: '',
                fill: false,
                data: [
                    { x: 4, y: 3 },
                    { x: 5, y: 5 },
                    { x: 6, y: 7 },
                    { x: 7, y: 9 },
                ],
                borderWidth: 2,
                pointRadius: 0,
                borderColor: 'gray',
            },
            {
                label: '',
                fill: false,
                data: [{ x: 4, y: 3 }],
                pointRadius: 7,
                pointBackgroundColor: '#5b76fa',
                borderWidth: 1,
                pointBorderColor: '#5b76fa',
            },
        ],
    };

    return (
        <ChartPanelWrapper>
            <ChartHeaderWrapper>
                <ChartBox>
                    <ChartHeaderFullElement>
                        <ChartHeaderTopElement>
                            Token Price
                        </ChartHeaderTopElement>
                        <ChartHeaderBottomElement>
                            1.25 DXD/DAI
                        </ChartHeaderBottomElement>
                    </ChartHeaderFullElement>
                </ChartBox>
                <ChartBox>
                    <ChartHeaderFullElement>
                        <ChartHeaderTopElement>24h price</ChartHeaderTopElement>
                        <ChartHeaderBottomElement className="green-text">
                            +10.51%
                        </ChartHeaderBottomElement>
                    </ChartHeaderFullElement>
                </ChartBox>
                <ChartBox>
                    <ChartHeaderFullElement>
                        <ChartHeaderTopElement>Minted</ChartHeaderTopElement>
                        <ChartHeaderBottomElement>
                            41.02 DXD
                        </ChartHeaderBottomElement>
                    </ChartHeaderFullElement>
                </ChartBox>
            </ChartHeaderWrapper>
            <ChartWrapper>
                <Line
                    data={data}
                    options={options}
                    // width={1000}
                    // height={250}
                />
            </ChartWrapper>
        </ChartPanelWrapper>
    );
});

export default BondingCurveChart;
