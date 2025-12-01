import React, { useState } from 'react';
import { Button, Stack, Text, Title, Input, Box, Space } from '@mantine/core';
import axios from 'axios';
import { notifications } from "@mantine/notifications";

// This is a placeholder and should be replaced with your actual wagmi components and logic
const ConnectWalletButton = () => {
    return <Button>Connect Wallet</Button>;
};

// This is a placeholder for the transaction execution
const executeTransaction = async (proof, publicSignals) => {
    console.log("Mock transaction submitted with proof:", proof, "and signals:", publicSignals);
    return { transactionHash: "0x123abc..." };
};

const ZKPPage = ({ isConnected }) => {
    const [input0, setInput0] = useState("");
    const [input1, setInput1] = useState("");

    const handleGenerateProofSendTransaction = async (e) => {
        e.preventDefault();
        if (!isConnected) {
            notifications.show({
                message: "Please connect your wallet to generate a proof.",
                color: "red",
            });
            return;
        }

        const data = { input0, input1 };
        const config = { headers: { "Content-Type": "application/json" } };

        try {
            const res = await axios.post("/api/generate_proof", data, config);
            notifications.show({
                message: "Proof generated successfully! Submitting transaction...",
                color: "green",
            });

            const { proof, publicSignals } = res.data;
            const txResult = await executeTransaction(proof, publicSignals);
            const txHash = txResult.transactionHash;

            notifications.show({
                message: `Transaction succeeded! Tx Hash: ${txHash}`,
                color: "green",
                autoClose: false,
            });
        } catch (err) {
            const statusCode = err?.response?.status;
            const errorMsg = err?.response?.data?.error;
            notifications.show({
                message: `Error ${statusCode}: ${errorMsg}`,
                color: "red",
            });
        }
    };

    const renderSubmitButton = () => {
        if (!isConnected) {
            return <ConnectWalletButton />;
        }
        return (
            <Button type="submit">Generate Proof & Send Transaction</Button>
        );
    };

    return (
        <Stack spacing="xl">
            {/* ZK Proof Section */}
            <Box p="md" style={{ border: '1px solid #eee', borderRadius: '8px' }}>
                <Title order={3}>ZK Simple Multiplier</Title>
                <Text mb="sm">
                    {"Input two numbers between 0 and 5, inclusive. A ZK proof will be generated and verified on-chain."}
                </Text>
                <form onSubmit={handleGenerateProofSendTransaction}>
                    <Stack spacing="sm">
                        <Input.Wrapper label="Input 0">
                            <Input
                                placeholder="Number between 0 and 5"
                                value={input0}
                                onChange={(e) => setInput0(e.currentTarget.value)}
                            />
                        </Input.Wrapper>
                        <Input.Wrapper label="Input 1">
                            <Input
                                placeholder="Number between 0 and 5"
                                value={input1}
                                onChange={(e) => setInput1(e.currentTarget.value)}
                            />
                        </Input.Wrapper>
                        <Space h={10} />
                        {renderSubmitButton()}
                    </Stack>
                </form>
            </Box>
        </Stack>
    );
};

export default ZKPPage;
