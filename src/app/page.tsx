"use client";

import { use, useEffect, useState } from "react";

import { useAccount, useConnect, useDisconnect, useToken } from "wagmi";
import { useBalance } from "wagmi";
import { usePublicClient } from "wagmi";

const ethers = require("ethers");

function App() {
  const account = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const {
    data: balanceData,
    isError: isErrorBalance,
    isLoading: isLoadingBalance,
  } = useBalance({
    address: account?.address,
  });

  const { disconnect } = useDisconnect();

  const [inputValue, setInputValue] = useState<any>("");
  const [tokenAddress, setTokenAddress] = useState<any>("");
  const [recipientAddress, setRecipientAddress] = useState<any>("");
  const [amount, setAmount] = useState("");

  const {
    data: tokenData,
    isError: isTokenError,
    isLoading: isTokenLoading,
  } = useToken({
    address: tokenAddress,
  });

  const handleTokenSubmit = (event: any) => {
    event.preventDefault();
    console.log(inputValue);
  };

  // Handle the token transfer
  const handleTransfer = async (event: any) => {
    event.preventDefault();

    if (!account || !window.ethereum) {
      console.error("Wallet not connected or Ethereum provider not found");
      return;
    }

    // Create a provider and signer

    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const signer = provider.getSigner();

    // Assume 'tokenAddress' and 'tokenData.decimals' are available from previous context
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ["function transfer(address to, uint amount) returns (bool)"],
      signer
    );

    try {
      const tx = await tokenContract.transfer(
        recipientAddress,
        ethers.utils.parseUnits(amount, 6)
      );
      await tx.wait();
      console.log("Transfer successful");
    } catch (error) {
      console.error("Transfer failed:", error);
    }
  };

  if (isLoadingBalance) return <div>Fetching balance…</div>;
  if (isErrorBalance) return <div>Error fetching balance</div>;

  return (
    <>
      <div>
        <div>
          Balance: {balanceData?.formatted} {balanceData?.symbol}
        </div>
        <h2>Account</h2>

        <div>
          status: {account.status}
          <br />
          addresses: {JSON.stringify(account.addresses)}
          <br />
          chainId: {account.chainId}
        </div>

        {account.status === "connected" && (
          <button type="button" onClick={() => disconnect()}>
            Disconnect
          </button>
        )}
      </div>

      <div>
        <h2>Connect</h2>
        {connectors.map((connector) => (
          <button
            key={connector.uid}
            onClick={() => connect({ connector })}
            type="button"
          >
            {connector.name}
          </button>
        ))}
        <div>{status}</div>
        <div>{error?.message}</div>
      </div>

      <div>
        <h2>Submit Form</h2>
        <form onSubmit={handleTokenSubmit}>
          <input
            type="text"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            placeholder="Enter ERC-20 Token Address"
          />
          <button type="submit">Fetch Token Data</button>
        </form>

        {/* Displaying token data */}
        {isTokenLoading && <div>Loading token data...</div>}
        {isTokenError && <div>Error fetching token data</div>}
        {tokenData && (
          <div>
            <p>Name: {tokenData.name}</p>
            <p>Symbol: {tokenData.symbol}</p>
            <p>Decimals: {tokenData.decimals}</p>
          </div>
        )}
      </div>

      <form onSubmit={handleTransfer}>
        <input
          type="text"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          placeholder="Recipient Address"
        />
        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount to Transfer"
        />
        <button type="submit">Transfer Tokens</button>
      </form>
    </>
  );
}

export default App;
