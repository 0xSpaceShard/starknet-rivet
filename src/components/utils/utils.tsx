export function shortenAddress(address: string | null | undefined, length: number = 12): string {
  if (!address?.length) return '';
  if (address.length <= length * 2) return address;
  return `${address.slice(0, length)}...${address.slice(-length)}`;
}

export function handleCopyAddress(address: string | null | undefined) {
  if (!address) return;
  navigator.clipboard.writeText(address);
}

export function getBalanceStr(balance: string): string {
  const balanceBigInt = BigInt(balance) / BigInt(10n ** 18n);
  return balanceBigInt.toString();
}
