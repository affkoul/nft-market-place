import { createContext, FunctionComponent, useContext, useEffect, useState } from "react"
// import { createDefaultState, createWeb3State, loadContract, Web3State } from "./utils";
import { createDefaultState, createWeb3State, Web3State } from "./utils";
import { ethers } from "ethers";
import { MetaMaskInpageProvider } from "@metamask/providers";
import { NftMarketContract } from "@_types/nftMarketContract";

const pageReload = () => { window.location.reload(); }

const handleAccount = (ethereum: MetaMaskInpageProvider) => async () => {
  const isLocked =  !(await ethereum._metamask.isUnlocked());
  if (isLocked) { pageReload(); }
}

const setGlobalListeners = (ethereum: MetaMaskInpageProvider) => {
  ethereum.on("chainChanged", pageReload);
  ethereum.on("accountsChanged", handleAccount(ethereum));
}

const removeGlobalListeners = (ethereum: MetaMaskInpageProvider) => {
  ethereum?.removeListener("chainChanged", pageReload);
  ethereum?.removeListener("accountsChanged", handleAccount);
}

const Web3Context = createContext<Web3State>(createDefaultState());

const Web3Provider: FunctionComponent = ({children}) => {
  const [web3Api, setWeb3Api] = useState<Web3State>(createDefaultState());

  const [provider, setProvider] = useState<ethers.providers.Web3Provider | undefined>();
  const [signer, setSigner] = useState<ethers.providers.JsonRpcSigner | undefined>();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [signedContract, setSignedContract] = useState<ethers.Contract | undefined>();
  const name = "NftMarket";
  const NETWORK_ID = process.env.NEXT_PUBLIC_NETWORK_ID as any;

  useEffect(() => {
    try {
      const ethereumProvider = new ethers.providers.Web3Provider(window.ethereum as any);
      setProvider(ethereumProvider);
    } catch (error) {
      console.error("Sorry, could not load ethereum provider", error);
      setWeb3Api((api) => createWeb3State({
        ...api as any,
        isLoading: false,
      }));
    }
  }, []);

  useEffect(() => {
    const theSigner = provider?.getSigner();
    setSigner(theSigner);
    // console.log("signer", signer);
  }, [provider]);

  useEffect(() => {
    // console.log("Ran");
    const fetchData = async () => {
      try {
        const response = await fetch(`/contracts/${name}.json`);
        const artifact = await response.json();

        if (artifact.networks[NETWORK_ID]?.address) {
          const loadedContract = new ethers.Contract(
            artifact.networks[NETWORK_ID].address,
            artifact.abi,
            provider
          );

          setContract(loadedContract);
        } else {
          console.error(
            `Contract: [${name}] does not have an address for the specified network ID.`
          );
        }
      } catch (error) {
        // Handle fetch or contract loading errors
        console.error("Error loading contract:", error);
      }
    };

    fetchData();
  }, [NETWORK_ID, name, provider]);

  // useEffect(() => {
  //   const loadAndSetContract = () => {
  //     try {
  //       if (provider) {
  //         const theContract = loadContract("NftMarket", provider);
  //         setContract(theContract);
  //       }
  //     } catch (error) {
  //       console.error("Error loading contract:", error);
  //       setWeb3Api((api) => createWeb3State({
  //         ...api as any,
  //         isLoading: false,
  //       }));
  //     }
  //   };

  //   loadAndSetContract();
  // }, [provider]);

  useEffect(() => {
    const connectAndSetWeb3Api = async () => {
      if (contract && signer) {
        const theSignedContract = contract?.connect(signer);
        setSignedContract(theSignedContract);

        setTimeout(() => setGlobalListeners(window.ethereum), 500);

        setWeb3Api(createWeb3State({
          ethereum: window.ethereum,
          provider,
          contract: signedContract as unknown as NftMarketContract,
          isLoading: false,
        }));
      }
    };

    connectAndSetWeb3Api();

    return () => removeGlobalListeners(window.ethereum);
  }, [contract, signer]);

  // useEffect(() => {
  //   async function initWeb3() {
  //     try {
  //       const provider = new ethers.providers.Web3Provider(window.ethereum as any);
  //       const contract =  loadContract("NftMarket", provider);

  //       const signer = provider.getSigner();
  //       const signedContract = contract?.connect(signer);

  //       setTimeout(() => setGlobalListeners(window.ethereum), 500);
  //       setWeb3Api(createWeb3State({
  //         ethereum: window.ethereum,
  //         provider,
  //         contract: signedContract as unknown as NftMarketContract,
  //         isLoading: false
  //       }))
  //     } catch(e: any) {
  //       console.error("Please, install web3 wallet");
  //       setWeb3Api((api) => createWeb3State({
  //         ...api as any,
  //         isLoading: false,
  //       }))
  //     }
  //   }

  //   initWeb3();
  //   return () => removeGlobalListeners(window.ethereum);
  // }, [])

  return (
    <Web3Context.Provider value={web3Api}>
      {children}
    </Web3Context.Provider>
  )
}

export function useWeb3() {
  return useContext(Web3Context);
}

export function useHooks() {
  const { hooks } = useWeb3();
  return hooks;
}

export default Web3Provider;









