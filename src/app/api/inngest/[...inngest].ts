import { inngest } from "@/lib/inngest/client";
import { generateIndustryInsights } from "@/lib/inngest/function";
import { serve } from "inngest/next";

export const { GET, POST, handler }: any = serve({
    client: inngest,
    functions:[
        generateIndustryInsights,
    ]
})

export {handler as default}