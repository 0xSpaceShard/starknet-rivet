import { shortenAddress, handleCopyAddress, getBalanceStr } from '../utils/utils';

describe('shortenAddress', () => {
  test('should properly shorten address', () => {
    expect(shortenAddress('')).toBe('');
    expect(shortenAddress('0x12345678')).toBe('0x12345678');
    expect(shortenAddress('0xb794f5ea0ba39494ce839613fffba74279579268')).toBe(
      '0xb794f5ea0b...a74279579268'
    );
    expect(shortenAddress('0xb794f5ea0ba39494ce839613fffba74279579268', 3)).toBe('0xb...268');
  });
});

describe('handleCopyAddress', () => {
  let buffer = '';

  // clipboard API mock
  beforeEach(() => {
    buffer = '';
    // @ts-ignore
    global.navigator.clipboard = {
      writeText: jest.fn((text) => {
        buffer = text;
      }),
      readText: jest.fn(() => buffer),
    };
  });

  test('should properly copy address to clipboard', () => {
    expect(global.navigator.clipboard.readText()).toBe('');
    const addr = '0x123456';
    handleCopyAddress(addr);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(addr);
    expect(navigator.clipboard.readText()).toBe(addr);
  });
});

describe('getBalanceStr', () => {
  test('should correctly convert balance to string representation in whole units', () => {
    const balance = '1000000000000000000'; // 1 ETH in Wei
    expect(getBalanceStr(balance)).toBe('1');
  });

  test('should handle balances that are exactly zero', () => {
    const balance = '0';
    expect(getBalanceStr(balance)).toBe('0');
  });

  test('should handle balances with leading zeros', () => {
    const balance = '0000000000000000001000000000000000000'; // Equivalent to 1 ETH
    expect(getBalanceStr(balance)).toBe('1');
  });

  test('should return "0" for balance less than 10^18', () => {
    const balance = '999999999999999999'; // Less than 1 ETH in Wei
    expect(getBalanceStr(balance)).toBe('0');
  });
});
