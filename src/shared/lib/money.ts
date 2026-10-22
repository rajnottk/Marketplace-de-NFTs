import Decimal from "decimal.js";

const ethPrecision = 4;

const cardPricePrecision = 2;

export const formatEth = (value: string) =>
  `${new Decimal(value).toFixed(ethPrecision)} ETH`;

export const formatEthShort = (value: string) =>
  `${new Decimal(value).toFixed(cardPricePrecision)} ETH`;

export const addEth = (...values: string[]) =>
  values
    .reduce((total, value) => total.plus(new Decimal(value)), new Decimal(0))
    .toFixed(ethPrecision);

export const multiplyEth = (value: string, quantity: number) =>
  new Decimal(value).mul(quantity).toFixed(ethPrecision);