import dotenv from 'dotenv'
dotenv.config();
import { GoogleGenerativeAI as gemini } from "@google/generative-ai";

const genAI = new gemini(process.env.GEMINI_API_KEY);

// async function AnalyzeDisasterReport(images, claimedType, text, location, currentDate, useGrounding = true) {
//     if (!process.env.GEMINI_API_KEY) {
//         throw new Error('GEMINI API KEY is Missing');
//     }

//     const PROMPT = `
// **ROLE**
// You are the single verification-and-alerting engine for DisasterWatch, a live crowd-reporting system. You replace three legacy stages (text check, image check, alert-title generation) with one pass. Be conservative: when evidence is thin or stale, say so plainly rather than guessing.

// **CONTEXT**
// - Today's date: "${currentDate}" — a report (and any supporting image) is only considered CURRENT if the underlying event is active on this date or the day before. Anything older is stale, even if 100% real.
// - Claimed disaster type: "${claimedType}"
// - Claimed location: "${location}"
// - Reporter's text: "${text}"
// - Supporting images attached: ${images && images.length > 0 ? images.length : 0}

// **VERIFICATION STEPS — perform all that apply, in order**

// 1. **Text plausibility & consistency**
//    - Does the reporter's text plausibly describe a "${claimedType}" at "${location}"?
//    - Flag vague, contradictory, or generic text that could describe any disaster.

// 2. **Image checks (run per image, if any are attached)**
//    - Realism gate: if an image is a cartoon, illustration, AI-generated, meme, or otherwise not a real-world photo, that image fails outright — it cannot be used to support "typeMatch" and pushes misinformationScore up.
//    - Content match: does the image show visual evidence consistent with "${claimedType}"?
//    - Provenance/freshness: to the extent you can determine it (via search grounding if available, or visible contextual clues such as watermarks, embedded text, or landmarks), does the image look like it originates from "${currentDate}" or the day before, at "${location}"? If you cannot verify freshness at all, say so explicitly rather than assuming it's current.

// 3. **External corroboration (only if you have live search/grounding available — do not fabricate sources otherwise)**
//    - Look for official or credible corroboration (NDMA, IMD, CWC, local government/police alerts, credible news) of a "${claimedType}" at "${location}" active on "${currentDate}" or the day before.
//    - IMPORTANT — corroboration is supporting evidence, not a requirement. If text and image evidence are independently convincing, the ABSENCE of corroboration must NOT by itself cause "isDisaster" or "typeMatch" to be false. A genuinely new, small-scale, or very recent event may have no news coverage yet — that is exactly the kind of report this platform exists to surface early, not suppress. Corroboration, when FOUND, should raise your confidence. When NOT found, simply record that fact in "corroborationFound" and note it in "keyIndicators" — do not treat it as a strike against the report.
//    - If you have no search capability in this call at all, set "corroborationFound" to null (not false) and do not claim to have checked.

// 4. **Synthesis**
//    - Combine text + image + (if available) external findings into one holistic judgment.
//    - An event that is real but old (e.g. from months ago) and being passed off as happening now is high-confidence misinformation, even though the underlying event once happened.

// 5. **Alert title (only if the report is approved — see status rule below)**
//    - Write a single-string, official-sounding alert title: Disaster Type + Severity + specific Location, urgent and concise, max 10-12 words.
//    - Example style: "Critical Wildfire Alert: Evacuations ordered for Northern Hills."
//    - If the report is rejected, set "alertTitle" to null — do not generate a title for an unverified/stale/mismatched report.

// 6. **Rejection reasons (populate whenever the report is rejected, i.e. isDisaster is false OR typeMatch is false)**
//    - Produce one entry in "rejectionReasons" for EVERY distinct problem you found — do not collapse multiple issues into one vague entry.
//    - Each entry must use one of these codes (pick the closest fit; do not invent new codes):
//      - "STALE_EVENT": the reported disaster itself is real but happened before "${currentDate}" minus one day. Include both dates in the message.
//      - "STALE_IMAGE": a specific image is real but was taken/originates from before the valid window. Include the image's index (1-based, in attachment order), its estimated/found date, and the valid date range.
//      - "TYPE_MISMATCH": the text and/or image content describes a different disaster than the claimed "${claimedType}". State the claimed type vs. the type the evidence actually supports.
//      - "LOCATION_MISMATCH": the event/image evidence points to a different location than claimed "${location}". State both locations if known.
//      - "UNREALISTIC_IMAGE": an image (give its index) is a cartoon, illustration, AI-generated, or otherwise not a real photo.
//      - "INSUFFICIENT_TEXT": the text is too vague/generic to confirm or deny anything about the claimed disaster.
//      - "INCONSISTENT_EVIDENCE": text and image(s) contradict each other about what happened.
//    - Do NOT use lack of corroboration as a rejection code — that is tracked separately in "corroborationFound", never in "rejectionReasons".
//    - Each entry's "message" must be a complete, user-facing sentence — plain language, include any concrete dates, locations, or image indices involved, no jargon. This is what gets shown directly to the person who submitted the report.
//    - If the report is approved (isDisaster true AND typeMatch true), "rejectionReasons" MUST be an empty array.

// 7. **Per-image breakdown**
//    - Populate "imageAnalysis" with exactly one entry per attached image, in the order attached (index starts at 1). If no images were attached, return an empty array.
//    - For each image, report whether it's a real photo, whether it matches the claimed disaster type, its best-estimate date/origin if determinable (or null if you truly cannot tell — do not guess a fake date), and a one-line note explaining your finding.

// **OUTPUT — respond with ONLY this JSON object, no markdown, no commentary**
// {
//   "status": "approved" | "rejected",
//   "isDisaster": boolean,
//   "typeMatch": boolean,
//   "corroborationFound": boolean | null,
//   "disasterType": "Wildfire" | "Flood" | "Earthquake" | "Landslide" | null,
//   "confidence": number,
//   "severity": "medium" | "high" | "critical",
//   "description": string,
//   "keyIndicators": string[],
//   "misinformationScore": number,
//   "alertTitle": string | null,
//   "rejectionReasons": [
//     {
//       "code": "STALE_EVENT" | "STALE_IMAGE" | "TYPE_MISMATCH" | "LOCATION_MISMATCH" | "UNREALISTIC_IMAGE" | "INSUFFICIENT_TEXT" | "INCONSISTENT_EVIDENCE",
//       "message": string,
//       "imageIndex": number | null,
//       "claimedDate": string | null,
//       "actualDate": string | null
//     }
//   ],
//   "imageAnalysis": [
//     {
//       "imageIndex": number,
//       "isRealPhoto": boolean,
//       "matchesClaimedType": boolean,
//       "estimatedDate": string | null,
//       "isCurrent": boolean,
//       "note": string
//     }
//   ]
// }

// Field notes:
// - "status": "approved" only if isDisaster is true AND typeMatch is true; otherwise "rejected". This must always agree with "rejectionReasons" being empty vs. non-empty.
// - "isDisaster": true if there is credible evidence FROM TEXT AND/OR IMAGE of an ACTUAL, CURRENT disaster at the claimed location. Corroboration is not required for this to be true — see step 3.
// - "typeMatch": true only if the evidence you actually verified (not just claimed) supports "${claimedType}" specifically, and is current per the date rule above.
// - "corroborationFound": true if you found credible external confirmation, false if you searched and found none, null if grounding/search was unavailable for this call. This never by itself forces isDisaster or typeMatch to false.
// - "severity": the real, current severity; force to "low" if isDisaster is false.
// - "description": 1-3 sentences, high-level summary only — the detailed "why" belongs in "rejectionReasons", not repeated here.
// - "keyIndicators": short evidence strings, e.g. "Image 1 is a real photo but dated to Dec 2023", "No corroborating alerts found yet for ${currentDate} — event may be too recent for news coverage", "Text is consistent with flooding".
// - "misinformationScore": 0.0-1.0 confidence that this report is misleading (stale-but-real event framed as new = 1.0).
// - "claimedDate"/"actualDate" on a rejection entry: use "${currentDate}" as the claimed date for freshness issues, and your best-found date for actualDate; use null for either if not applicable/unknown (never fabricate a date).
// `;

//     try {
//         const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

//         const promptParts = [{ text: PROMPT }];

//         if (images && images.length > 0) {
//             for (const image of images) {
//                 if (image.base64 && image.mimeType) {
//                     promptParts.push({
//                         inlineData: {
//                             data: image.base64,
//                             mimeType: image.mimeType
//                         }
//                     });
//                 }
//             }
//         }

//         const requestConfig = {
//             contents: [{ role: "user", parts: promptParts }],
//         };

//         if (useGrounding) {
//             requestConfig.tools = [{ googleSearch: {} }];
//         }

//         const result = await model.generateContent(requestConfig);
//         const responseText = result.response.text();

//         const jsonMatch = responseText.match(/\{[\s\S]*\}/);
//         if (!jsonMatch) throw new Error("No valid JSON found in AI response");

//         const analysis = JSON.parse(jsonMatch[0]);

//         const isDisaster = Boolean(analysis.isDisaster);
//         const typeMatch = Boolean(analysis.typeMatch);
//         const approved = isDisaster && typeMatch;

//         const rejectionReasons = Array.isArray(analysis.rejectionReasons) ? analysis.rejectionReasons : [];

//         return {
//             ...analysis,
//             isDisaster,
//             typeMatch,
//             corroborationFound: analysis.corroborationFound ?? null,
//             status: approved ? "approved" : "rejected",
//             alertTitle: approved ? (analysis.alertTitle ?? null) : null,
//             rejectionReasons: approved ? [] : rejectionReasons,
//             imageAnalysis: Array.isArray(analysis.imageAnalysis) ? analysis.imageAnalysis : [],
//         };
//     } catch (error) {
//         console.error("Failed to analyze disaster report:", error.message);
//         return {
//             status: "rejected",
//             isDisaster: false,
//             typeMatch: false,
//             corroborationFound: null,
//             disasterType: null,
//             confidence: 0.0,
//             severity: "low",
//             description: `Analysis failed due to an internal error. ${error.message}`,
//             keyIndicators: ["Error", "Function execution error"],
//             misinformationScore: 1.0,
//             alertTitle: null,
//             rejectionReasons: [
//                 {
//                     code: "INSUFFICIENT_TEXT",
//                     message: "The report could not be analyzed due to a system error. Please try submitting again.",
//                     imageIndex: null,
//                     claimedDate: null,
//                     actualDate: null,
//                 },
//             ],
//             imageAnalysis: [],
//         };
//     }
// }

/**
 * Verify a disaster report using images, claimed disaster type,
 * and user-provided description.
*
* @param {Array<{base64Image: string, mimeType: string}>} images
* @param {string} disasterType
* @param {string} description
* @returns {Promise<Object>}
*/
export async function AnalyzeDisasterReport(images, disasterType, description) {

    if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI API KEY is Missing");

    const PROMPT = `
You are a disaster-report verification engine for DisasterWatch.

Your task is to verify whether the submitted images, claimed disaster type,
and description consistently indicate ONE real disaster or whether the report
is misinformation/inconsistent.

IMPORTANT:
- This is a verification task, NOT a general image description task.
- Analyze ALL provided images.
- Compare the visual evidence against the CLAIMED disaster type and description.
- Do not assume the user's claim is true.
- Be conservative when evidence is weak.
- Do not invent information that cannot be determined from the images.
- A real photograph does not automatically mean the report is valid.
- The images must actually support the claimed disaster.
- If multiple images are provided, they should be reasonably consistent with
  the same claimed disaster/event.
- Do not reject a report merely because an exact location or date cannot be
  determined.

CLAIMED DISASTER TYPE:
"${disasterType}"

USER DESCRIPTION:
"${description}"

SUPPORTED DISASTER TYPES:
- Wildfire
- Flood
- Earthquake
- Landslide

VERIFICATION RULES:

1. REALITY CHECK

For every image determine whether it appears to be a genuine real-world
photograph.

Reject evidence from:
- AI-generated images
- illustrations
- cartoons
- memes
- screenshots
- obvious digitally manipulated images
- movie/TV scenes
- obviously unrelated stock imagery

If an image is clearly not a genuine real-world photograph:
- isRealPhoto = false
- matchesClaimedType = false
- add "UNREALISTIC_IMAGE" to rejectionReasons.

2. DISASTER TYPE VERIFICATION

Compare the visual evidence with the claimed disaster type.

Examples:

Flood:
- standing/rising water
- submerged roads
- flooded buildings
- overflowing rivers
- water damage

Wildfire:
- active flames
- wildfire smoke
- burned vegetation
- fire spreading through natural/urban areas
- visible wildfire damage

Earthquake:
- collapsed/damaged buildings
- major structural destruction
- earthquake-related ground damage
- fallen infrastructure

Landslide:
- soil/rock movement
- collapsed slopes
- debris covering roads
- exposed earth caused by slope failure

Do NOT classify an image as a disaster merely because it contains:
- rain
- smoke
- damaged-looking objects
- normal construction
- ordinary water
- dirt
- fire-like colors
- unrelated destruction

3. DESCRIPTION VERIFICATION

Compare the description with what can actually be observed.

The description should:
- describe the same disaster
- not contradict the image
- contain enough meaningful information

If the description is extremely vague or does not provide enough information
to support the claim, use:

"INSUFFICIENT_TEXT"

If the description contradicts the visual evidence, use:

"INCONSISTENT_EVIDENCE"

4. MULTIPLE IMAGE CONSISTENCY

If multiple images are provided:

- Determine whether they support the same claimed disaster.
- Different camera angles of the same type of disaster are acceptable.
- Different locations or scenes can still be acceptable if they clearly depict
  the same disaster type.
- If one image is completely unrelated or contradicts the others, flag it.

5. TYPE MATCH

"typeMatch" must be true ONLY when the evidence reasonably supports the
claimed disaster type.

If the image clearly shows a different disaster type:

- typeMatch = false
- status = rejected
- add "TYPE_MISMATCH"

6. DISASTER DECISION

Set:

"isDisaster": true

ONLY when the evidence reasonably indicates that a real disaster is present.

Set:

"isDisaster": false

when:
- no disaster is visible
- the evidence is insufficient
- the images are unrelated
- the images are unrealistic
- the claimed disaster cannot reasonably be supported

7. STATUS

Set "status" to "approved" ONLY when:

- at least one image is a genuine real-world photograph
- the images reasonably support a disaster
- the disaster type matches the user's claimed type
- the description does not contradict the images
- there is sufficient evidence to make the decision

Otherwise:

"status": "rejected"

8. CONFIDENCE

Return a number between 0 and 1.

Examples:

0.90 - 1.00:
Very strong visual evidence.

0.75 - 0.89:
Strong evidence with minor uncertainty.

0.50 - 0.74:
Moderate or ambiguous evidence.

0.00 - 0.49:
Weak or insufficient evidence.

9. SEVERITY

Only use:

"medium"
"high"
"critical"

Use:

critical:
Immediate and widespread threat to life.

high:
Significant danger with substantial damage or potential escalation.

medium:
Localized disaster with meaningful but limited danger.

Do not use "low".

10. MISINFORMATION SCORE

Return a number between 0 and 1.

0.00 - 0.20:
Very little evidence of misinformation.

0.21 - 0.50:
Some uncertainty or inconsistencies.

0.51 - 0.70:
Significant uncertainty/inconsistency.

0.71 - 1.00:
Strong evidence that the report is misleading, fabricated,
unrelated, or contradictory.

11. REJECTION REASONS

Only include reasons that actually apply.

Allowed codes:

TYPE_MISMATCH
UNREALISTIC_IMAGE
INSUFFICIENT_TEXT
INCONSISTENT_EVIDENCE

For each reason provide:

- code
- user-facing message
- imageIndex when applicable
- claimedDate = null
- actualDate = null

Do not invent dates.

12. IMAGE ANALYSIS

Return one object for EVERY submitted image.

imageIndex must correspond to the zero-based image index.

For every image return:

- imageIndex
- isRealPhoto
- matchesClaimedType
- estimatedDate
- isCurrent
- note

If the date cannot be determined:

estimatedDate = null
isCurrent = null

Never invent a date.

13. ALERT TITLE

If status is "approved", generate a short useful alert title.

Example:

"Severe Flooding Reported in Residential Area"

If rejected:

alertTitle = null

14. DISASTER TYPE

If the report is valid, return the normalized disaster type:

"Wildfire"
"Flood"
"Earthquake"
"Landslide"

If the report is rejected and the actual disaster type cannot be confidently
determined:

disasterType = null

If the images clearly show a different disaster type, return the ACTUAL
detected disaster type.

15. KEY INDICATORS

Return concrete visual indicators that support the decision.

Example:

[
  "Vehicles partially submerged",
  "Road covered with standing water",
  "Floodwater surrounding residential buildings"
]

Do not invent indicators.

16. DESCRIPTION

Return a concise verification summary explaining why the report was
approved or rejected.

17. OUTPUT

Respond ONLY with this JSON object.
No markdown.
No commentary.
No code fences.

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
      "code": "TYPE_MISMATCH" | "UNREALISTIC_IMAGE" | "INSUFFICIENT_TEXT" | "INCONSISTENT_EVIDENCE",
      "message": string,
      "imageIndex": number | null,
      "claimedDate": null,
      "actualDate": null
    }
  ],
  "imageAnalysis": [
    {
      "imageIndex": number,
      "isRealPhoto": boolean,
      "matchesClaimedType": boolean,
      "estimatedDate": null,
      "isCurrent": null,
      "note": string
    }
  ]
}
`;

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
        });

        const imageParts = images.map((image) => ({
            inlineData: {
                data: image.base64,
                mimeType: image.mimeType,
            },
        }));

        const result = await model.generateContent({
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: PROMPT,
                        },
                        ...imageParts,
                    ],
                },
            ],
            generationConfig: {
                responseMimeType: "application/json",
            },
        });

        const responseText = result.response.text();

        let analysis;

        try {
            analysis = JSON.parse(responseText);

        } catch (parseError) {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);

            if (!jsonMatch) {
                throw new Error("AI returned invalid JSON");
            }

            analysis = JSON.parse(jsonMatch[0]);
        }

        // Normalize/sanitize AI output before returning it.
        return {
            status: analysis.status === "approved"
                ? "approved"
                : "rejected",

            isDisaster: Boolean(analysis.isDisaster),

            typeMatch: Boolean(analysis.typeMatch),

            disasterType:
                analysis.disasterType || null,

            confidence: Math.max(
                0,
                Math.min(
                    1,
                    Number(analysis.confidence) || 0
                )
            ),

            severity:
                ["medium", "high", "critical"].includes(
                    analysis.severity
                )
                    ? analysis.severity
                    : "medium",

            description:
                analysis.description || "",

            keyIndicators:
                Array.isArray(analysis.keyIndicators)
                    ? analysis.keyIndicators
                    : [],

            misinformationScore: Math.max(
                0,
                Math.min(
                    1,
                    Number(analysis.misinformationScore) || 0
                )
            ),

            alertTitle:
                analysis.alertTitle || null,

            rejectionReasons:
                Array.isArray(analysis.rejectionReasons)
                    ? analysis.rejectionReasons
                    : [],

            imageAnalysis:
                Array.isArray(analysis.imageAnalysis)
                    ? analysis.imageAnalysis
                    : [],
        };

    } catch (error) {
        console.error(
            "Failed to analyze disaster report:",
            error
        );

        throw new Error(
            `Disaster report analysis failed: ${error.message}`
        );
    }
}