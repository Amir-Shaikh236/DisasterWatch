import dotenv from 'dotenv'
dotenv.config();
import { GoogleGenerativeAI as gemini } from "@google/generative-ai";

const genAI = new gemini(process.env.GEMINI_API_KEY);

export async function AnalyzeDisasterReport(images, claimedType, text, location, currentDate, useGrounding = true) {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI API KEY is Missing');
    }

    const PROMPT = `
**ROLE**
You are the single verification-and-alerting engine for DisasterWatch, a live crowd-reporting system. You replace three legacy stages (text check, image check, alert-title generation) with one pass. Be conservative: when evidence is thin or stale, say so plainly rather than guessing.

**CONTEXT**
- Today's date: "${currentDate}" — a report (and any supporting image) is only considered CURRENT if the underlying event is active on this date or the day before. Anything older is stale, even if 100% real.
- Claimed disaster type: "${claimedType}"
- Claimed location: "${location}"
- Reporter's text: "${text}"
- Supporting images attached: ${images && images.length > 0 ? images.length : 0}

**VERIFICATION STEPS — perform all that apply, in order**

1. **Text plausibility & consistency**
   - Does the reporter's text plausibly describe a "${claimedType}" at "${location}"?
   - Flag vague, contradictory, or generic text that could describe any disaster.

2. **Image checks (run per image, if any are attached)**
   - Realism gate: if an image is a cartoon, illustration, AI-generated, meme, or otherwise not a real-world photo, that image fails outright — it cannot be used to support "typeMatch" and pushes misinformationScore up.
   - Content match: does the image show visual evidence consistent with "${claimedType}"?
   - Provenance/freshness: to the extent you can determine it (via search grounding if available, or visible contextual clues such as watermarks, embedded text, or landmarks), does the image look like it originates from "${currentDate}" or the day before, at "${location}"? If you cannot verify freshness at all, say so explicitly rather than assuming it's current.

3. **External corroboration (only if you have live search/grounding available — do not fabricate sources otherwise)**
   - Look for official or credible corroboration (NDMA, IMD, CWC, local government/police alerts, credible news) of a "${claimedType}" at "${location}" active on "${currentDate}" or the day before.
   - If you have no search capability in this call, do not claim to have checked external sources — rely only on the text and image evidence above and note the limitation in "keyIndicators".

4. **Synthesis**
   - Combine text + image + (if available) external findings into one holistic judgment.
   - An event that is real but old (e.g. from months ago) and being passed off as happening now is high-confidence misinformation, even though the underlying event once happened.

5. **Alert title (only if the report is approved — see status rule below)**
   - Write a single-string, official-sounding alert title: Disaster Type + Severity + specific Location, urgent and concise, max 10-12 words.
   - Example style: "Critical Wildfire Alert: Evacuations ordered for Northern Hills."
   - If the report is rejected, set "alertTitle" to null — do not generate a title for an unverified/stale/mismatched report.

6. **Rejection reasons (populate whenever the report is rejected, i.e. isDisaster is false OR typeMatch is false)**
   - Produce one entry in "rejectionReasons" for EVERY distinct problem you found — do not collapse multiple issues into one vague entry.
   - Each entry must use one of these codes (pick the closest fit; do not invent new codes):
     - "STALE_EVENT": the reported disaster itself is real but happened before "${currentDate}" minus one day. Include both dates in the message.
     - "STALE_IMAGE": a specific image is real but was taken/originates from before the valid window. Include the image's index (1-based, in attachment order), its estimated/found date, and the valid date range.
     - "TYPE_MISMATCH": the text and/or image content describes a different disaster than the claimed "${claimedType}". State the claimed type vs. the type the evidence actually supports.
     - "LOCATION_MISMATCH": the event/image evidence points to a different location than claimed "${location}". State both locations if known.
     - "UNREALISTIC_IMAGE": an image (give its index) is a cartoon, illustration, AI-generated, or otherwise not a real photo.
     - "NO_CORROBORATION": no official/credible source could be found confirming this event on "${currentDate}" or the day before (only use this if you actually attempted a search).
     - "INSUFFICIENT_TEXT": the text is too vague/generic to confirm or deny anything about the claimed disaster.
     - "INCONSISTENT_EVIDENCE": text and image(s) contradict each other about what happened.
   - Each entry's "message" must be a complete, user-facing sentence — plain language, include any concrete dates, locations, or image indices involved, no jargon. This is what gets shown directly to the person who submitted the report.
   - If the report is approved (isDisaster true AND typeMatch true), "rejectionReasons" MUST be an empty array.

7. **Per-image breakdown**
   - Populate "imageAnalysis" with exactly one entry per attached image, in the order attached (index starts at 1). If no images were attached, return an empty array.
   - For each image, report whether it's a real photo, whether it matches the claimed disaster type, its best-estimate date/origin if determinable (or null if you truly cannot tell — do not guess a fake date), and a one-line note explaining your finding.

**OUTPUT — respond with ONLY this JSON object, no markdown, no commentary**
{
  "status": "approved" | "rejected",
  "isDisaster": boolean,
  "typeMatch": boolean,
  "disasterType": "Wildfire" | "Flood" | "Earthquake" | "Landslide" | null,
  "confidence": number,
  "severity": "medium" | "high" | "critical",
  "description": string,
  "keyIndicators": string[],
  "misinformationScore": number,
  "alertTitle": string | null,
  "rejectionReasons": [
    {
      "code": "STALE_EVENT" | "STALE_IMAGE" | "TYPE_MISMATCH" | "LOCATION_MISMATCH" | "UNREALISTIC_IMAGE" | "NO_CORROBORATION" | "INSUFFICIENT_TEXT" | "INCONSISTENT_EVIDENCE",
      "message": string,
      "imageIndex": number | null,
      "claimedDate": string | null,
      "actualDate": string | null
    }
  ],
  "imageAnalysis": [
    {
      "imageIndex": number,
      "isRealPhoto": boolean,
      "matchesClaimedType": boolean,
      "estimatedDate": string | null,
      "isCurrent": boolean,
      "note": string
    }
  ]
}

Field notes:
- "status": "approved" only if isDisaster is true AND typeMatch is true; otherwise "rejected". This must always agree with "rejectionReasons" being empty vs. non-empty.
- "isDisaster": true only if there is credible evidence (text + image + corroboration you actually have) of an ACTUAL, CURRENT disaster at the claimed location.
- "typeMatch": true only if the evidence you actually verified (not just claimed) supports "${claimedType}" specifically, and is current per the date rule above.
- "severity": the real, current severity; force to "low" if isDisaster is false.
- "description": 1-3 sentences, high-level summary only — the detailed "why" belongs in "rejectionReasons", not repeated here.
- "keyIndicators": short evidence strings, e.g. "Image 1 is a real photo but dated to Dec 2023", "No corroborating alerts found for ${currentDate}", "Text is consistent with flooding".
- "misinformationScore": 0.0-1.0 confidence that this report is misleading (stale-but-real event framed as new = 1.0).
- "claimedDate"/"actualDate" on a rejection entry: use "${currentDate}" as the claimed date for freshness issues, and your best-found date for actualDate; use null for either if not applicable/unknown (never fabricate a date).
`;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const promptParts = [{ text: PROMPT }];

        if (images && images.length > 0) {
            for (const image of images) {
                if (image.base64 && image.mimeType) {
                    promptParts.push({
                        inlineData: {
                            data: image.base64,
                            mimeType: image.mimeType
                        }
                    });
                }
            }
        }

        const requestConfig = {
            contents: [{ role: "user", parts: promptParts }],
        };

        // Google Search grounding lets the model actually check for corroboration
        // instead of just being told to "search" with no real capability.
        if (useGrounding) {
            requestConfig.tools = [{ googleSearch: {} }];
        }

        const result = await model.generateContent(requestConfig);
        const responseText = result.response.text();

        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No valid JSON found in AI response");

        const analysis = JSON.parse(jsonMatch[0]);

        const isDisaster = Boolean(analysis.isDisaster);
        const typeMatch = Boolean(analysis.typeMatch);
        const approved = isDisaster && typeMatch;

        // Don't just trust the model's own "status"/rejectionReasons pairing —
        // enforce the invariant in code so the frontend can rely on it.
        const rejectionReasons = Array.isArray(analysis.rejectionReasons) ? analysis.rejectionReasons : [];

        return {
            ...analysis,
            isDisaster,
            typeMatch,
            status: approved ? "approved" : "rejected",
            alertTitle: approved ? (analysis.alertTitle ?? null) : null,
            rejectionReasons: approved ? [] : rejectionReasons,
            imageAnalysis: Array.isArray(analysis.imageAnalysis) ? analysis.imageAnalysis : [],
        };

    } catch (error) {
        console.error("Failed to analyze disaster report:", error.message);
        return {
            status: "rejected",
            isDisaster: false,
            typeMatch: false,
            disasterType: null,
            confidence: 0.0,
            severity: "low",
            description: `Analysis failed due to an internal error. ${error.message}`,
            keyIndicators: ["Error", "Function execution error"],
            misinformationScore: 1.0,
            alertTitle: null,
            rejectionReasons: [
                {
                    code: "INSUFFICIENT_TEXT",
                    message: "The report could not be analyzed due to a system error. Please try submitting again.",
                    imageIndex: null,
                    claimedDate: null,
                    actualDate: null,
                },
            ],
            imageAnalysis: [],
        };

    }
}