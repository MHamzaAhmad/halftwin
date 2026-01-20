import { GoogleGenAI, type Part } from "@google/genai";

const ENHANCEMENT_PROMPT = `You are a professional photo retoucher helping someone feel more confident. Analyze this selfie and create a subtly enhanced version.

WHAT YOU CAN IMPROVE (subtle tweaks only):

HAIR & GROOMING:
- Make hair look nicely combed and groomed, remove rough/messy appearance
- If slight baldness/thinning: fill it in naturally to look fuller
- If significant baldness: improve appearance WITHOUT adding a wig - make it look intentional and stylish
- Touch up mustache and beard to look groomed and neat
- Keep natural hair color and style

FACE STRUCTURE:
- If jawline is asymmetric, make it more balanced and symmetric
- Slightly refine jawline definition if beneficial
- Keep natural bone structure recognizable

FEATURES:
- EYES: Brighten, reduce dark circles, make them pop
- NOSE: Minor refinements if it helps balance the face
- EARS: Subtle adjustments if visible and needed
- SKIN: Smooth blemishes, even tone, add healthy glow - but keep texture natural

OTHER:
- BODY: Subtle slimming or toning if body is visible - nothing dramatic
- LIGHTING: Improve overall lighting and shadows
- COLOR GRADING: Warm, flattering tones

CRITICAL RULES - DO NOT VIOLATE:
1. THE PERSON MUST REMAIN 100% RECOGNIZABLE - this is NOT a transformation
2. Keep the SAME camera angle, perspective, and framing - do NOT change these
3. Keep the SAME pose and expression
4. Keep the SAME background and environment
5. All changes must be SUBTLE - think "magazine touch-up" not "plastic surgery"
6. The sweet spot: viewers should think "they look good!" not "that's a different person"
7. Preserve unique features that make them who they are - their identity must be intact
8. If something doesn't need fixing, leave it alone

The goal is to hide insecurities while keeping authenticity and identity. Generate the enhanced image.`;

export interface EnhanceResult {
	success: boolean;
	imageBase64?: string;
	mimeType?: string;
	error?: string;
}

export async function enhanceImage(
	imageBase64: string,
	mimeType: string,
	apiKey: string
): Promise<EnhanceResult> {
	try {
		if (!apiKey) {
			return {
				success: false,
				error: "API key not configured. Please set GEMINI_API_KEY.",
			};
		}

		const ai = new GoogleGenAI({ apiKey });

		const imagePart: Part = {
			inlineData: {
				data: imageBase64,
				mimeType,
			},
		};

		const response = await ai.models.generateContent({
			model: "gemini-3-pro-image-preview",
			contents: [
				{
					role: "user",
					parts: [{ text: ENHANCEMENT_PROMPT }, imagePart],
				},
			],
			config: {
				responseModalities: ["image", "text"],
			},
		});

		// Look for image in response
		if (response.candidates && response.candidates.length > 0) {
			const parts = response.candidates[0].content?.parts;
			if (parts) {
				for (const part of parts) {
					if (part.inlineData) {
						return {
							success: true,
							imageBase64: part.inlineData.data,
							mimeType: part.inlineData.mimeType || "image/png",
						};
					}
				}
			}
		}

		return {
			success: false,
			error: "No enhanced image was generated. Please try again.",
		};
	} catch (error) {
		console.error("Gemini enhancement error:", error);

		// Parse error to provide specific feedback
		const errorMessage = error instanceof Error ? error.message : String(error);
		const errorString = errorMessage.toLowerCase();

		// API key errors
		if (errorString.includes("api key") ||
			errorString.includes("api_key") ||
			errorString.includes("invalid key") ||
			errorString.includes("unauthorized") ||
			errorString.includes("401")) {
			return {
				success: false,
				error: "Invalid API key. Please check your Gemini API key configuration.",
			};
		}

		// Rate limit errors
		if (errorString.includes("rate limit") ||
			errorString.includes("quota") ||
			errorString.includes("resource exhausted") ||
			errorString.includes("429") ||
			errorString.includes("too many requests")) {
			return {
				success: false,
				error: "Rate limit exceeded. Please wait a moment and try again.",
			};
		}

		// Model/service unavailable
		if (errorString.includes("model") &&
			(errorString.includes("not found") || errorString.includes("unavailable"))) {
			return {
				success: false,
				error: "The image enhancement service is temporarily unavailable. Please try again later.",
			};
		}

		// Safety/content filters
		if (errorString.includes("safety") ||
			errorString.includes("blocked") ||
			errorString.includes("harmful") ||
			errorString.includes("content filter")) {
			return {
				success: false,
				error: "Image could not be processed due to content restrictions. Please try a different photo.",
			};
		}

		// Network errors
		if (errorString.includes("network") ||
			errorString.includes("fetch") ||
			errorString.includes("timeout") ||
			errorString.includes("econnrefused") ||
			errorString.includes("enotfound")) {
			return {
				success: false,
				error: "Network error. Please check your connection and try again.",
			};
		}

		// Generic fallback with more context
		return {
			success: false,
			error: `Enhancement failed: ${errorMessage.slice(0, 100)}`,
		};
	}
}
