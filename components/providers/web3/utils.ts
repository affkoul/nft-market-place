import { setupHooks, Web3Hooks } from "@hooks/web3/setupHooks";
import { MetaMaskInpageProvider } from "@metamask/providers";
import { Web3Dependencies } from "@_types/hooks";
import { Contract, ethers, providers } from "ethers";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    ethereum: MetaMaskInpageProvider;
  }
}

type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

export type Web3State = {
  isLoading: boolean; // true while loading web3State
  hooks: Web3Hooks;
} & Nullable<Web3Dependencies>;

export const createDefaultState = () => {
  return {
    ethereum: null,
    provider: null,
    contract: null,
    isLoading: true,
    hooks: setupHooks({ isLoading: true } as any),
  };
};

export const createWeb3State = ({
  ethereum,
  provider,
  contract,
  isLoading,
}: Web3Dependencies) => {
  return {
    ethereum,
    provider,
    contract,
    isLoading,
    hooks: setupHooks({ ethereum, provider, contract, isLoading }),
  };
};

const NETWORK_ID = process.env.NEXT_PUBLIC_NETWORK_ID as any;

// export const loadContract = (
//   name: string, // NftMarket
//   provider: providers.Web3Provider | undefined
// ): Contract | null => {
//   const [contract, setContract] = useState<Contract | null>(null);

//   useEffect(() => {
//     // console.log("Ran");
//     const fetchData = async () => {
//       try {
//         const response = await fetch(`/contracts/${name}.json`);
//         const artifact = await response.json();

//         if (artifact.networks[NETWORK_ID]?.address) {
//           const loadedContract = new ethers.Contract(
//             artifact.networks[NETWORK_ID].address,
//             artifact.abi,
//             provider
//           );

//           setContract(loadedContract);
//         } else {
//           console.error(
//             `Contract: [${name}] does not have an address for the specified network ID.`
//           );
//         }
//       } catch (error) {
//         // Handle fetch or contract loading errors
//         console.error("Error loading contract:", error);
//       }
//     };

//     fetchData();
//   }, [name, provider]);

//   return contract;
// };
