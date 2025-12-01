import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { generateProof } from "./src/lib/generateProof.js"; // make sure generateProof.js uses ESM exports

const app = express();

// Enable CORS for your frontend
app.use(cors({ origin: "http://localhost:5173" }));
app.use(bodyParser.json());

app.post("/generate_proof", async (req, res) => {
    const { input0, input1 } = req.body;
    if (input0 === undefined || input1 === undefined) {
        return res.status(400).json({ error: "Missing inputs" });
    }

    try {
        const proof = await generateProof(parseInt(input0), parseInt(input1));
        res.json(proof);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(4000, () => console.log("Backend running on http://localhost:4000"));
