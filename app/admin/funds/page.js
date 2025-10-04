"use client";

import { useState, useEffect, useCallback } from "react";
import AdminLayout from "../components/AdminLayout";

export default function FundManagement() {
  const [addFundsForm, setAddFundsForm] = useState({
    memberId: "",
    walletAddress: "",
    amount: "",
    includeCommissions: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [bnbBalance, setBnbBalance] = useState("0.0000");
  const [bnbPrice, setBnbPrice] = useState(null);
  const [priceLoading, setPriceLoading] = useState(false);

  // Check if wallet is connected
  const checkWalletConnection = useCallback(async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });

        if (accounts.length > 0) {
          setWalletConnected(true);
          setWalletAddress(accounts[0]);
          await getBnbBalance(accounts[0]);
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    }
  }, []);

  // Get BNB balance
  const getBnbBalance = async (address) => {
    try {
      const result = await window.ethereum.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      });

      const balance = parseInt(result, 16) / Math.pow(10, 18);
      setBnbBalance(balance.toFixed(4));
    } catch (error) {
      console.error("Error getting BNB balance:", error);
    }
  };

  // Connect wallet function
  const connectWallet = async () => {
    try {
      if (typeof window.ethereum === "undefined") {
        alert("Please install MetaMask to connect your wallet");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        setWalletConnected(true);
        setWalletAddress(accounts[0]);
        await getBnbBalance(accounts[0]);
        // Don't auto-fill the recipient wallet address - that should be entered manually
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet");
    }
  };

  // Fetch BNB price on mount with timeout
  const fetchBnbPrice = useCallback(async () => {
    setPriceLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(
        "https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT",
        {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const price = parseFloat(data.price);

      if (isNaN(price) || price <= 0) {
        throw new Error("Invalid price data");
      }

      setBnbPrice(price);
    } catch (error) {
      console.warn("Failed to fetch BNB price:", error);
      setBnbPrice(300); // fallback
    } finally {
      setPriceLoading(false);
    }
  }, []);

  // Check wallet connection on mount
  useEffect(() => {
    checkWalletConnection();
    fetchBnbPrice();
  }, [checkWalletConnection, fetchBnbPrice]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddFundsForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddFunds = async (e) => {
    e.preventDefault();

    if (
      !addFundsForm.memberId ||
      !addFundsForm.walletAddress ||
      !addFundsForm.amount
    ) {
      setMessage({ type: "error", text: "Please fill in all fields" });
      return;
    }

    const amount = parseFloat(addFundsForm.amount);
    if (isNaN(amount) || amount <= 0) {
      setMessage({
        type: "error",
        text: "Please enter a valid amount greater than 0",
      });
      return;
    }

    if (amount > 10000) {
      setMessage({
        type: "error",
        text: "Amount cannot exceed $10,000 per transaction",
      });
      return;
    }

    if (!walletConnected) {
      setMessage({
        type: "error",
        text: "Please connect your MetaMask wallet first",
      });
      return;
    }

    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Check if MetaMask is installed and connected
      if (typeof window.ethereum === "undefined") {
        throw new Error("Please install MetaMask to transfer funds");
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length === 0) {
        throw new Error("Please connect your wallet to MetaMask");
      }

      // Use cached BNB price or fallback
      const currentBnbPrice = bnbPrice || 300;
      const bnbAmount = (amount / currentBnbPrice).toFixed(6);

      // Confirm the transaction
      const confirmMessage = `Transfer ${bnbAmount} BNB?\n\nFrom: Your Wallet (${accounts[0].slice(
        0,
        6
      )}...${accounts[0].slice(-4)})\nTo: ${
        addFundsForm.walletAddress
      }\nRecipient: ${addFundsForm.memberId}\nAmount: $${
        addFundsForm.amount
      } (${bnbAmount} BNB)`;
      if (!confirm(confirmMessage)) {
        setIsLoading(false);
        return;
      }

      // Validate recipient address
      if (!/^0x[a-fA-F0-9]{40}$/.test(addFundsForm.walletAddress)) {
        throw new Error("Invalid recipient wallet address format");
      }

      // Prevent sending to self
      if (
        addFundsForm.walletAddress.toLowerCase() === accounts[0].toLowerCase()
      ) {
        throw new Error("Cannot send funds to your own wallet address");
      }

      // Send BNB transaction via MetaMask
      const transactionHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: accounts[0],
            to: addFundsForm.walletAddress,
            value: `0x${(parseFloat(bnbAmount) * Math.pow(10, 18)).toString(
              16
            )}`,
            gas: "0x5208", // 21000 gas limit for simple transfer
          },
        ],
      });

      if (transactionHash) {
        // Now update the database with the transaction
        const adminToken = localStorage.getItem("adminToken");
        if (!adminToken) {
          throw new Error("No admin token found");
        }

        const response = await fetch("/api/admin/add-funds", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${adminToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...addFundsForm,
            amount: amount,
            transactionHash: transactionHash,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to record transaction in database"
          );
        }

        // Create success message with transaction details
        let successMessage = `✅ Transaction Successful!\n\n`;
        successMessage += `Transaction Hash: ${transactionHash}\n`;
        successMessage += `Amount: ${bnbAmount} BNB ($${amount})\n`;
        successMessage += `Recipient: ${data.user.memberId}\n`;
        successMessage += `To Address: ${addFundsForm.walletAddress}\n`;
        successMessage += `Status: Confirmed\n`;
        successMessage += `BNB Price: $${currentBnbPrice.toFixed(2)}`;

        if (data.commissions && data.commissions.length > 0) {
          successMessage += `\n\n🎉 COMMISSIONS DISTRIBUTED:\n`;
          successMessage += `Total Paid: $${data.totalCommissionsPaid}\n`;
          successMessage += `Recipients: ${data.commissionsDistributed} sponsors\n`;
          successMessage += `User received: $${data.user.userAmountReceived}\n\n`;

          data.commissions.forEach((commission) => {
            successMessage += `Level ${commission.level}: ${commission.sponsorName} (${commission.sponsorId})\n`;
            successMessage += `  💰 ${commission.commissionRate} = $${commission.commissionAmount}\n`;
          });
        }

        setMessage({ type: "success", text: successMessage });
        setAddFundsForm({
          memberId: "",
          walletAddress: "",
          amount: "",
          includeCommissions: true,
        });

        // Refresh BNB balance
        await getBnbBalance(accounts[0]);
      }
    } catch (error) {
      console.error("Error adding funds:", error);
      setMessage({ type: "error", text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Fund Management</h1>
        <p className="mt-2 text-gray-600">
          Handle financial operations and transactions
        </p>
      </div>

      {/* Add Funds Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-4">
            <span className="text-white text-xl">💰</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add Funds</h2>
            <p className="text-gray-600">Add funds to user accounts</p>
          </div>
        </div>

        {/* Wallet Connection Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className={`w-4 h-4 rounded-full animate-pulse ${
                  walletConnected ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {walletConnected
                    ? "Your MetaMask Wallet Connected"
                    : "MetaMask Wallet Not Connected"}
                </h3>
                {walletConnected && (
                  <div className="text-sm text-gray-600">
                    <div>
                      Your Address: {walletAddress.slice(0, 6)}...
                      {walletAddress.slice(-4)}
                    </div>
                    <div>Your BNB Balance: {bnbBalance} BNB</div>
                    <div>
                      Current BNB Price: $
                      {bnbPrice
                        ? bnbPrice.toFixed(2)
                        : priceLoading
                        ? "Loading..."
                        : "N/A"}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={connectWallet}
              disabled={walletConnected}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                walletConnected
                  ? "bg-green-100 text-green-800 border border-green-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white hover:scale-105"
              }`}
            >
              {walletConnected ? "Connected" : "Connect MetaMask"}
            </button>
          </div>
        </div>

        {/* Message Display */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-start">
              <span className="text-lg mr-2 mt-0.5">
                {message.type === "success" ? "✅" : "❌"}
              </span>
              <div className="whitespace-pre-line text-sm">{message.text}</div>
            </div>
          </div>
        )}

        <form onSubmit={handleAddFunds} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Member ID Field */}
            <div>
              <label
                htmlFor="memberId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Member ID
              </label>
              <input
                type="text"
                id="memberId"
                name="memberId"
                value={addFundsForm.memberId}
                onChange={handleInputChange}
                placeholder="Enter Member ID"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>

            {/* Wallet Address Field */}
            <div>
              <label
                htmlFor="walletAddress"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Recipient&apos;s Wallet Address
              </label>
              <input
                type="text"
                id="walletAddress"
                name="walletAddress"
                value={addFundsForm.walletAddress}
                onChange={handleInputChange}
                placeholder="Enter recipient's wallet address"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>

            {/* Amount Field */}
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  $
                </span>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={addFundsForm.amount}
                  onChange={handleInputChange}
                  placeholder="Enter $ amount to add"
                  step="0.01"
                  min="0.01"
                  max="10000"
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
            </div>
          </div>

          {/* Commission Option */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="includeCommissions"
              name="includeCommissions"
              checked={addFundsForm.includeCommissions}
              onChange={handleInputChange}
              className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
            />
            <label
              htmlFor="includeCommissions"
              className="text-sm font-medium text-gray-700"
            >
              Include commission distribution to sponsors (like purchase
              simulation)
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading || !walletConnected}
              className={`px-8 py-3 rounded-lg font-medium text-white transition-all duration-200 flex items-center ${
                isLoading || !walletConnected
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:scale-105 shadow-lg hover:shadow-xl"
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing Transaction...
                </>
              ) : !walletConnected ? (
                <>
                  <span className="mr-2">🔗</span>
                  Connect Wallet First
                </>
              ) : (
                <>
                  <span className="mr-2">💰</span>
                  Transfer Funds
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
