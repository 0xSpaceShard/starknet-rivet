import Decimal from 'decimal.js';

export function shortenAddress(address: string | null | undefined, length: number = 12): string {
  if (!address?.length) return '';
  if (address.length <= length * 2) return address;
  return `${address.slice(0, length)}...${address.slice(-length)}`;
}

export function handleCopyToClipboard(str: string | null | undefined) {
  if (!str) return;
  navigator.clipboard.writeText(str);
}

export function getBalanceStr(balance: string | bigint): string {
  const balanceBigInt = BigInt(balance) / BigInt(10n ** 18n);
  return balanceBigInt.toString();
}

export function getNormalizedDecimalString(amountHex: string): string {
  const amountDecimal = new Decimal(BigInt(amountHex).toString()).div('1e18');

  if (amountDecimal.e === 1) {
    return amountDecimal.toString();
  }

  const scaled = amountDecimal.div(new Decimal(10).pow(amountDecimal.e));
  return scaled.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toString();
}
