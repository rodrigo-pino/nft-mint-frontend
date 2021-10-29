import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, {useEffect, useState} from "react";
import {ethers} from "ethers";
import myEpicNft from "./utils/MyEpicNFT.json";

// Constants
const TWITTER_HANDLE = 'Rothroo4';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = "https://testnets.opensea.io/collection/squarenft-iwyqcyt3qe";

const App = () => {
    const [currentAccount, setCurrentAccount] = useState("");
    const CONTRACT_ADDRESS = "0xB91499c5205E0e77bFAB171a8A5Fcd3ac35961DA";
    
    const checkIfWalletIsConnected = async () => {
        const {ethereum} = window;
        if (!ethereum) {
            console.log("Metamsk not detected!");
            return; } else {
            console.log("Got the ethereum object", ethereum);
        }
        const accounts = await ethereum.request({method: 'eth_accounts'});
        if (accounts.length !== 0) {
            const account = accounts[0];
            console.log("Found an authorized account:", account);
            setCurrentAccount(account);
            setupEventListener();
        } else {
            console.log("No authorized account found");
        }
    }
    
    const checkIfRinkeby = async() => {
        const {ethereum} = window;
        if (!ethereum) {
            console.log("Metamsk not detected!");
            return; } else {
            console.log("Got the ethereum object", ethereum);
        }
        
        let chainId = await ethereum.request({method: "eth_chainId"});
        console.log("Connected to chain " + chainId);

        const rinkebyChainId = "0x4";
        if (chainId !== rinkebyChainId) {
            alert("You are not connected to the Rinkeby Test Network!");
        }
    }
    const connectWallet = async () => {
        try {
            const {ethereum} = window;
            if (!ethereum) {
                alert("Get MetaMask!");
                return;
            }
            const accounts = await ethereum.request({method: "eth_requestAccounts"});
            console.log("Connected",accounts[0]);
            setCurrentAccount(accounts[0]);
            setupEventListener()
        } catch (error) {
            console.log(error);
        }
    }

    const setupEventListener = async () => {
        try {
            const {ethereum} = window;
            
            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
                connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
                    console.log("Event Captured", from, tokenId.toNumber());
                    alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now, it can be a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assests/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`);
                });
                connectedContract.on("TotalNFTsMinted", (curr, tot) => {
                    console.log("(current, total) = ", curr.toNumber(), ",", tot.toNumber());
                    currentNFTsMinted = curr;
                    totalNFTsMinted = tot;
                    alert(`Reamining tokens: ${totalNFTsMinted - currentNFTsMinted}`);
                });
            } else {
                console.log("Ethereum object does not exists");
            }
        } catch (error) {
            console.log(error);
        }
    }

    const askContractToMintNft = async () => {
        try {
            const {ethereum} = window;
            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

                console.log("Going to pop wallet now to pay gas...");
                let nftTxn = await connectedContract.makeAnEpicNFT();

                console.log("Mining ...");
                await nftTxn.wait();

                console.log(`Mined, see transaction at: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
            } else {
                console.log("Ethereum object does not exist!");
            }
    } catch (error) {
        console.log(error);
    }
    }
    
    let currentNFTsMinted = -1;
    let totalNFTsMinted = -1;
    const askTotalMintedSoFar = async() => {
        console.log("Getting current NFTs minted")
        try {
            const {ethereum} = window;
            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
                let nftTxn = await connectedContract.getTotalNFTMinted();
                console.log("Mining ...");
                await nftTxn.wait();
                console.log("Mined");
            } else {
                console.log("Ethereum object does not exists!");
            }
        } catch(error) {
            console.log(error);
        }
    }

    useEffect(() => {
        checkIfWalletIsConnected(); checkIfRinkeby();
    }, [])

    // Render Methods
    const renderNotConnectedContainer = () => (
        <button onClick={connectWallet} className="cta-button connect-wallet-button">
          Connect to Wallet
        </button>
    );
    const renderConnectedContainer = () => (
        <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
            Mint NFT
        </button>
    );
    const renderNFTsLeft = () => (
        <button onClick={askTotalMintedSoFar} className="cta-button connect-wallet-button">
            Reamining NFTs
        </button>
    );

    const renderViewCollection = () => (
        <button onClick={() => alert(`See collection at: ${OPENSEA_LINK}`)} className="cta-button connect-wallet-button">
            See Collection
        </button>
    );
    return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount === "" ? renderNotConnectedContainer() : renderConnectedContainer()}
        </div>
        <div className="header-container">
          {renderViewCollection()}
        </div>
        <div className="header-container">
          {renderNFTsLeft() }
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
    );
};

export default App;
