import { GoogleGenerativeAI as gemini } from "@google/generative-ai";
import dotenv from 'dotenv'
dotenv.config();

if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI API KEY is not defined in your .env file.");
    throw new Error('GEMINI API KEY is Missing');
}

const genAI = new gemini(process.env.GEMINI_API_KEY);

/**
 * @param {string} base64Image
 * @param {string} mimeType
 * @param {string} assumedLocation - default region for contextual inference, e.g. "Pune, Maharashtra, India"
 * @param {string} currentDate - e.g. "2026-08-06", used for the same freshness logic as ReportAnalyzer
 * @param {boolean} useGrounding - attach Google Search grounding to help estimate image origin/date
 */
async function AI_AnalyzeImageForDisaster(
    base64Image,
    mimeType,
    assumedLocation = "Pune, Maharashtra, India",
    currentDate = new Date().toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" }),
    useGrounding = true
) {
    const PROMPT = `
**ROLE**
You are the same verification engine used by DisasterWatch's ReportAnalyzer, running here in standalone triage mode — no user claim to check against, just raw image screening. Apply the identical standards for realism and freshness that the full report pipeline uses, so a photo can't pass here and fail there (or vice versa).

**CONTEXT**
- Current date: "${currentDate}"
- Assumed region (only for inferring context if the image itself gives no better clue): "${assumedLocation}"

**STEPS — perform in order**

1. **Realism gate (run first, always)**
   - If the image is a cartoon, illustration, AI-generated image, meme, stock photo, movie/TV still, or otherwise not a genuine real-world photo, set "isRealPhoto" to false, "isDisaster" to false, "disasterType" to null, and "misinformationScore" to 1.0. Skip the remaining analysis steps and go straight to output.
   - Otherwise set "isRealPhoto" to true and continue.

2. **Disaster detection**
   - Identify the primary disaster type visible, if any: Wildfire, Flood, Earthquake, or Landslide. If none, "disasterType" must be null and "isDisaster" false.
   - Severity scale: "critical" = immediate widespread danger to life; "high" = significant threat, potential to escalate; "medium" = localized danger, needs monitoring; "low" = minor event, low immediate risk.

3. **Location & context inference**
   - Only if the image itself gives visual cues (landmarks, signage, terrain, language on signs) — infer a specific location. Do not default to "${assumedLocation}" as a location claim; use it only as background context. If no cues, "location" must be null.
   - "areaType": e.g. "urban", "rural", "forest", "coastal", "riverside" — null if not determinable.

4. **Freshness estimate**
   - To the extent determinable (via grounding if available, or visible cues like timestamps, weather, foliage state, embedded watermarks), estimate the image's likely origin date and set "estimatedDate" (or null if you truly cannot tell — never fabricate a date).
   - Compare against "${currentDate}": if the image appears to originate from well before today (a known past event, seasonal mismatch, outdated timestamp, etc.), that's a staleness flag even though the image is real.

5. **Flags (populate for every distinct issue found — empty array if the image is a clean, current, real disaster photo or a clean non-disaster photo)**
   - Use one of these fixed codes per entry:
     - "UNREALISTIC_IMAGE": image failed the realism gate in step 1.
     - "STALE_IMAGE": image is real but appears to predate the current window; include your best "estimatedDate" and reasoning in the message.
     - "AMBIGUOUS_DISASTER_TYPE": visual evidence doesn't clearly point to one disaster type over another.
     - "LOW_VISUAL_EVIDENCE": too little in the frame to support a confident judgment either way.
     - "POSSIBLE_STAGING": scene shows signs of being staged/altered/set up for the photo (distinct from being fully synthetic — this is for a real photo of a fake scenario).
   - Each entry: { "code", "message" (plain, user-facing sentence with concrete details), "estimatedDate" (or null) }.

6. **Misinformation scoring**
   - High (>0.7) only if the image is unreal (see gate), staged, digitally altered, or is a known hoax/meme. Be conservative — do not penalize genuine, unremarkable disaster photos.

**RESPONSE FORMAT — respond ONLY with this JSON object, no markdown, no commentary**
{
  "isRealPhoto": boolean,
  "isDisaster": boolean,
  "disasterType": "Wildfire" | "Flood" | "Earthquake" | "Landslide" | null,
  "confidence": number (0.0 to 1.0),
  "confidenceReasoning": string,
  "severity": "low" | "medium" | "high" | "critical",
  "location": string | null,
  "areaType": string | null,
  "estimatedDate": string | null,
  "description": string,
  "keyIndicators": string[],
  "potentialImpact": string,
  "recommendedActions": string[],
  "misinformationScore": number (0.0 to 1.0),
  "flags": [
    { "code": "UNREALISTIC_IMAGE" | "STALE_IMAGE" | "AMBIGUOUS_DISASTER_TYPE" | "LOW_VISUAL_EVIDENCE" | "POSSIBLE_STAGING", "message": string, "estimatedDate": string | null }
  ]
}
`;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const requestConfig = {
            contents: [{
                role: "user",
                parts: [
                    { text: PROMPT },
                    { inlineData: { data: base64Image, mimeType } },
                ],
            }],
        };

        if (useGrounding) {
            requestConfig.tools = [{ googleSearch: {} }];
        }

        const result = await model.generateContent(requestConfig);
        const responseText = result.response.text();

        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No valid JSON found in AI response");
        }

        const analysis = JSON.parse(jsonMatch[0]);
        const isRealPhoto = Boolean(analysis.isRealPhoto);

        return {
            isRealPhoto, // A non-real photo can never register as a disaster, regardless of what the model said.
            isDisaster: isRealPhoto ? Boolean(analysis.isDisaster) : false,
            disasterType: isRealPhoto ? (analysis.disasterType || null) : null,
            confidence: Math.max(0, Math.min(1, Number(analysis.confidence) || 0)),
            confidenceReasoning: analysis.confidenceReasoning || '',
            severity: isRealPhoto ? (analysis.severity || 'low') : 'low',
            location: analysis.location || null,
            areaType: analysis.areaType || null,
            estimatedDate: analysis.estimatedDate || null,
            description: analysis.description || '',
            keyIndicators: Array.isArray(analysis.keyIndicators) ? analysis.keyIndicators : [],
            potentialImpact: analysis.potentialImpact || '',
            recommendedActions: Array.isArray(analysis.recommendedActions) ? analysis.recommendedActions : [],
            misinformationScore: isRealPhoto
                ? Math.max(0, Math.min(1, Number(analysis.misinformationScore) || 0))
                : 1.0,
            flags: Array.isArray(analysis.flags) ? analysis.flags : [],
        };
    } catch (error) {
        console.error("Failed to analyze image for disaster:", error);
        return {
            isRealPhoto: false,
            isDisaster: false,
            disasterType: null,
            confidence: 0,
            confidenceReasoning: '',
            severity: 'low',
            location: null,
            areaType: null,
            estimatedDate: null,
            description: `Analysis failed due to an internal error. ${error.message}`,
            keyIndicators: [],
            potentialImpact: '',
            recommendedActions: [],
            misinformationScore: 1.0,
            flags: [{
                code: "LOW_VISUAL_EVIDENCE",
                message: "The image could not be analyzed due to a system error. Please try again.",
                estimatedDate: null,
            }],
        };
    }
}

export { AI_AnalyzeImageForDisaster }