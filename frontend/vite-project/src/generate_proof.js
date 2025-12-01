import { generateProof } from '@/lib/generateProof';

export default async function handler(req, res) {
    const body = req?.body;
    if (body === undefined) {
        return res.status(403).json({ error: "Request has no body" });
    }
    console.log(body);

    const input0 = parseInt(body.input0);
    const input1 = parseInt(body.input1);

    if (
        input0 === undefined || Number.isNaN(input0) ||
        input1 === undefined || Number.isNaN(input1)
    ) {
        return res.status(403).json({ error: "Invalid inputs" });
    }

    const proof = await generateProof(input0, input1);

    if (proof.proof === "") {
        return res.status(403).json({ error: "Proving failed" });
    }

    res.setHeader("Content-Type", "application/json");
    res.status(200).json(proof);
}
