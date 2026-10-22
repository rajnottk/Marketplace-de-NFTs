import Decimal from "decimal.js";

const ethPrecision = 4;

const cardPricePrecision = 2;

export const formatEth = (value: string) =>
  `${new Decimal(value).toFixed(ethPrecision)} ETH`;

export const formatEthShort = (value: string) =>
  `${new Decimal(value).toFixed(cardPricePrecision)} ETH`;

// Up to three decimals without trailing zeros, keeping at least two (e.g. "0.016 ETH", "26.83 ETH").
export const formatEthSummary = (value: string) => {
  const roundedValue = new Decimal(value).toDecimalPlaces(3);
  return `${roundedValue.decimalPlaces() < 2 ? roundedValue.toFixed(2) : roundedValue.toString()} ETH`;
};

export const addEth = (...values: string[]) =>
  values
    .reduce((total, value) => total.plus(new Decimal(value)), new Decimal(0))
    .toFixed(ethPrecision);

export const multiplyEth = (value: string, quantity: number) =>
  new Decimal(value).mul(quantity).toFixed(ethPrecision);