#!/usr/bin/env node

import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { exampleCounterArtifact } from "../contracts/generated/example-counter.js";
import { readTracking, toAddressMap } from "./deployment-registry.mjs";
import { parseOperationFlags, runOperation } from "./lib/operations.mjs";

const flags = parseOperationFlags();

await runOperation("write-contract-artifact", flags, async ({ step }) => {
	const outputDir = resolve(process.cwd(), "dapp", "src", "generated");
	const outputPath = resolve(outputDir, "contracts-addresses.js");
	const outputTsPath = resolve(outputDir, "contracts-addresses.ts");
	const chainId = Number(exampleCounterArtifact.chainId) || 2030;

	// Read deployed addresses from the deployment tracking file so that
	// successive `pnpm codegen` calls do NOT wipe addresses written by `pnpm deploy`.
	const trackingState = readTracking();
	const addressMap = toAddressMap(trackingState);

	const trackedAddress =
		addressMap[chainId]?.[exampleCounterArtifact.contractName] ?? null;
	const catalog = [
		{
			contractName: exampleCounterArtifact.contractName,
			chainId,
			trackedAddress,
			abiEntries: Array.isArray(exampleCounterArtifact.abi)
				? exampleCounterArtifact.abi.length
				: 0,
		},
	];

	step("load-contract-artifact", {
		status: "completed",
		contractName: exampleCounterArtifact.contractName,
		chainId,
	});

	mkdirSync(outputDir, { recursive: true });
	writeFileSync(
		outputPath,
		`export const CONTRACT_ADDRESSES_BY_CHAIN_ID = ${JSON.stringify(addressMap, null, 2)};\n\nexport function getContractAddress(chainId, contractName) {\n  return CONTRACT_ADDRESSES_BY_CHAIN_ID[chainId]?.[contractName] ?? null;\n}\n\nexport const CONTRACT_CATALOG = ${JSON.stringify(catalog, null, 2)};\n`,
		"utf8",
	);
	writeFileSync(
		outputTsPath,
		`export type ContractAddressMap = Record<number, Record<string, \`0x\${string}\`>>;\n\nexport const CONTRACT_ADDRESSES_BY_CHAIN_ID: ContractAddressMap = ${JSON.stringify(addressMap, null, 2)} as ContractAddressMap;\n\nexport function getContractAddress(chainId: number, contractName: string): \`0x\${string}\` | undefined {\n  return CONTRACT_ADDRESSES_BY_CHAIN_ID[chainId]?.[contractName];\n}\n\nexport const CONTRACT_CATALOG = ${JSON.stringify(catalog, null, 2)} as const;\n`,
		"utf8",
	);

	step("write-contract-catalog", {
		status: "completed",
		outputPath: "dapp/src/generated/contracts-addresses.js",
	});
	return {
		contractName: exampleCounterArtifact.contractName,
		chainId,
		trackedAddress,
		outputPath: "dapp/src/generated/contracts-addresses.js",
		message:
			"Wrote dapp/src/generated/contracts-addresses.js and contracts-addresses.ts",
	};
});
