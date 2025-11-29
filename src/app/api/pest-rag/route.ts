import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

const MODEL_ID = "gemini-2.5-flash";

function getGeminiClient() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GOOGLE_API_KEY environment variable for Gemini.");
  }
  return new GoogleGenerativeAI(apiKey);
}

async function fileToBase64(file: File): Promise<{ data: string; mimeType: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return {
    data: buffer.toString("base64"),
    mimeType: file.type || "image/jpeg",
  };
}

export async function POST(request: Request): Promise<Response> {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    const extraContext = (formData.get("context") as string | null) ?? "";

    if (!file) {
      return new Response(
        JSON.stringify({ error: "No image file provided." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const { data, mimeType } = await fileToBase64(file);

    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({
      model: MODEL_ID,
      tools: [{ googleSearch: {} }],
    } as any);

    const prompt = `
আপনি একজন বাংলাদেশের গ্রামীণ কৃষি সহায়ক বিশেষজ্ঞ।

আপনাকে একটি ফসলের পোকা বা ক্ষতির ছবি দেওয়া হয়েছে।
Google Search ব্যবহার করে (grounded তথ্য) এই পোকা/রোগ সম্পর্কে সর্বশেষ ও নির্ভরযোগ্য তথ্য দেখে নিন।

এরপর নিচের কাঠামো অনুযায়ী শুধুমাত্র একটি JSON রেসপন্স দিন (কোনো অতিরিক্ত লেখা নয়):

{
  "pest_name_bn": "বাংলা নাম বা বর্ণনা",
  "risk_level": "High | Medium | Low",
  "summary_bn": "সংক্ষেপে ঝুঁকি ও প্রভাবের বিবরণ (২-৩ বাক্য)",
  "action_plan_bn": [
    "ধাপ ধরে স্থানীয় ও ব্যবহারিক করণীয় লিখুন",
    "যত সম্ভব কম খরচের ও নিরাপদ পদ্ধতি দিন",
    "রাসায়নিক ব্যবহারের আগে বিকল্প পদ্ধতি উল্লেখ করুন"
  ]
}

অবস্থানগত প্রেক্ষাপট: বাংলাদেশ, ছোট ও মাঝারি কৃষক।
${extraContext ? `অতিরিক্ত তথ্য: ${extraContext}` : ""}
`;

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                data,
                mimeType,
              },
            } as any,
          ],
        },
      ],
      tools: [{ googleSearch: {} }],
    } as any);

    const response = await result.response;
    const text = response.text();

    let parsed: any = null;
    try {
      // Try to extract JSON even if wrapped in markdown fences
      const jsonMatch = text.match(/```json([\s\S]*?)```/i);
      const jsonString = jsonMatch ? jsonMatch[1] : text;
      parsed = JSON.parse(jsonString.trim());
    } catch {
      parsed = null;
    }

    const payload = {
      rawText: text,
      structured: parsed,
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Pest RAG error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}


