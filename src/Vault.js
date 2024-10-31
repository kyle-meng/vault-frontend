import React, { useState, useEffect } from "react";
import { ethers, providers } from "ethers";
import TokenAndEthVault from "./TokenAndEthVault.json"; // Ensure this points to your ABI

const contractAddress = "0xa5b43797902Ee4Dce48F82e5c36e19d52E757655"; // Replace with your deployed contract address
const sepolia_chainId = 11155111; // Sepolia 的链 ID
const Vault = () => {
    const [account, setAccount] = useState(null);
    const [token_amount, setTokenAmount] = useState("");
    const [eth_amount, setETHAmount] = useState("");
    const [key, setKey] = useState("");
    const [withdrawKey, setWithdrawKey] = useState("");
    useEffect(() => {
        const loadProvider = async () => {
            if (window.ethereum) {
                const provider = new providers.Web3Provider(window.ethereum);
                const { chainId } = await provider.getNetwork();

                if (chainId !== sepolia_chainId) {
                    alert("请切换到 Sepolia 网络!");
                    return;
                }

                const accounts = await provider.send("eth_requestAccounts", []);
                setAccount(accounts[0]);
            } else {
                alert("请安装 MetaMask!");
            }
        };
        loadProvider();
    }, []);

    const depositTokens = async () => {
        if (!token_amount) return;

        const provider = new providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const vaultContract = new ethers.Contract(
            contractAddress,
            TokenAndEthVault.abi,
            signer
        );

        const tx = await vaultContract.depositTokens(
            ethers.utils.parseUnits(token_amount, 18)
        ); // Assuming 18 decimals
        await tx.wait();
        viewKey();
        alert("Tokens deposited!");
    };

    const depositETH = async () => {
        if (!eth_amount) {
            alert("请输入金额");
            return;
        }
        try {
            const provider = new providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const vaultContract = new ethers.Contract(
                contractAddress,
                TokenAndEthVault.abi,
                signer
            );

            const tx = await vaultContract.depositETH({
                value: ethers.utils.parseEther(eth_amount),
            });
            await tx.wait();
            viewKey();
            alert("ETH deposited!");
        } catch (error) {
            if (error.code === "ACTION_REJECTED") {
                alert("用户拒绝了交易，请确认并重试。");
            } else {
                console.error("存入 ETH 时出错:", error);
                alert("存入 ETH 失败: " + error.message);
            }
        }
    };
    const withdraw = async () => {
        if (!withdrawKey) {
            alert("请输入Key");
            return;
        }
        try {
            const provider = new providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const vaultContract = new ethers.Contract(
                contractAddress,
                TokenAndEthVault.abi,
                signer
            );

            const tx = await vaultContract.withdraw(withdrawKey);
            await tx.wait();
            alert("取款成功!");
        } catch (error) {
            if (error.code === "ACTION_REJECTED") {
                alert("用户拒绝了取款，请确认并重试。");
            } else {
                console.error("取出 ETH 时出错:", error);
                alert("取出 ETH 失败: " + error.message);
            }
        }
    };

    const viewKey = async () => {
        const provider = new providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const vaultContract = new ethers.Contract(
            contractAddress,
            TokenAndEthVault.abi,
            signer
        );

        const latestKey = await vaultContract.view_key();
        setKey(latestKey);
    };

    const containerStyle = {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#f0f0f0",
        fontFamily: "Arial, sans-serif",
        color: "#333",
    };

    const inputStyle = {
        padding: "10px",
        margin: "10px 0",
        borderRadius: "5px",
        border: "1px solid #ccc",
        width: "200px", // 固定宽度
        height: "25px", // 固定高度
    };

    const buttonStyle = {
        padding: "10px 15px",
        borderRadius: "5px",
        border: "none",
        backgroundColor: "#007bff",
        color: "#fff",
        cursor: "pointer",
        width: "200px", // 固定宽度
        height: "40px", // 固定高度
    };

    const keyContainerStyle = {
        height: "flex", // 固定高度，确保位置不变
        display: "flex",
        flexDirection: "column",
        justifyContent: "left",
        alignItems: "left",
    };

    return (
        <div style={containerStyle}>
            <h1>Token Vault</h1>
            <p>Connected Account: {account}</p>
            <p>Contract Address: {contractAddress}</p>
            <div>
                <h2>Deposit Tokens</h2>
                <input
                    type="text"
                    placeholder="Amount"
                    style={inputStyle}
                    value={token_amount}
                    onChange={(e) => setTokenAmount(e.target.value)}
                />
                <button style={buttonStyle} onClick={depositTokens}>
                    Deposit Tokens
                </button>
            </div>
            <div>
                <h2>Deposit ETH</h2>
                <input
                    type="text"
                    placeholder="Amount"
                    style={inputStyle}
                    value={eth_amount}
                    onChange={(e) => setETHAmount(e.target.value)}
                />
                <button style={buttonStyle} onClick={depositETH}>
                    Deposit ETH
                </button>
            </div>
            <div>
                <h2>Withdraw Funds</h2>
                <input
                    type="text"
                    placeholder="Enter Key"
                    style={inputStyle}
                    value={withdrawKey}
                    onChange={(e) => setWithdrawKey(e.target.value)}
                />
                <button style={buttonStyle} onClick={withdraw}>
                    Withdraw
                </button>
            </div>
            <div style={keyContainerStyle}>
                <h2>View Deposit Key</h2>
                <button style={buttonStyle} onClick={viewKey}>
                    View Key
                </button>
                {key && <p>Deposit Key: {key}</p>}
            </div>
        </div>
    );
};

export default Vault;
