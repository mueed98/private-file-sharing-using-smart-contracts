import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
	solidity: {
		version: "0.8.24",
		settings: {
			optimizer: {
				enabled: true,
				runs: 200,
			},
		},
	},
	networks: {
		sepolia: {
			url: process.env.ARB_SEPOLIA_RPC,
			accounts: [process.env.PRIVATE_KEY_FOR_TESTING || ""],
		},
	},
	etherscan: {
		apiKey: {
			sepolia: process.env.ARBSCAN_SEPOLIA_API_KEY || "",
		},
		customChains: [
			{
				network: "sepolia",
				chainId: 421614,
				urls: {
					apiURL: "https://api-sepolia.arbiscan.io/api",
					browserURL: "https://sepolia.arbiscan.io/",
				},
			},
		],
	},
};

export default config;
