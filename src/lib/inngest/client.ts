import { Inngest } from "inngest";

//Creating a client to send and receive events
export const inngest = new Inngest({ id: "futuredge", name: "FututrEdge",
    credentials: {
        gemini: {
            apiKey: process.env.GEMINI_API_KEY
        }
    }
});