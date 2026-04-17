export type ContractAddressMap = Record<number, Record<string, `0x${string}`>>;

export const CONTRACT_ADDRESSES_BY_CHAIN_ID: ContractAddressMap = {
  "71": {
    "ExampleCounter": "0x976c5ead65b8f51c5cbf3117f41d11548f992b93"
  }
} as ContractAddressMap;

export function getContractAddress(chainId: number, contractName: string): `0x${string}` | undefined {
  return CONTRACT_ADDRESSES_BY_CHAIN_ID[chainId]?.[contractName];
}

export const CONTRACT_CATALOG = [
  {
    "contractName": "ExampleCounter",
    "chainId": 2030,
    "trackedAddress": null,
    "abiEntries": 9
  }
] as const;
