export function arrayToBigInt(arr: number[]): bigint {
    return arr.reduceRight((accumulated: bigint, current: number) => BigInt(accumulated) * (2n ** 32n) + BigInt(current), 0n);
}