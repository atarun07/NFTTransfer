import path from "path";
import * as snarkjs from "snarkjs";

export const generateProof = async (input0, input1) => {
    console.log(`Generating vote proof with inputs: ${input0}, ${input1}`);
    const inputs = { in: [input0, input1] };

    const wasmPath = path.resolve("/home/tarun/DDP/ZKP/zk_demo_app/circuits/build/simple_multiplier_js/simple_multiplier.wasm");
    const provingKeyPath = path.resolve("/home/tarun/DDP/ZKP/zk_demo_app/circuits/build/proving_key.zkey");

    try {
        const { proof, publicSignals } = await snarkjs.plonk.fullProve(inputs, wasmPath, provingKeyPath);

        const calldata = await snarkjs.plonk.exportSolidityCallData(proof, publicSignals);

        const matches = calldata.match(/\[.*?\]/g);
        if (!matches || matches.length < 2) {
            throw new Error(`Invalid calldata format: ${calldata}`);
        }

        const proofHex = JSON.parse(matches[0])[0];
        const signalsArray = JSON.parse(matches[1]).map(BigInt);

        console.log("Proof:", proofHex);
        console.log("Public Signals:", signalsArray);

        return {
            proof: proofHex,
            publicSignals: signalsArray.map(s => s.toString()) // convert BigInt to string
        };
    } catch (err) {
        console.error("Error generating proof:", err);
        return { proof: "", publicSignals: [] };
    }
};
