export function shortenAddress(address: string | null | undefined, length: number = 12): string {
  if (!address) return '';
  return `${address.slice(0, length)}...${address.slice(-length)}`;
}

export function handleCopyAddress(address: string | null | undefined) {
  if (!address) return;
  navigator.clipboard.writeText(address);
}
