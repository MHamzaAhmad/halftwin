import { GoogleGenAI, type Part } from "@google/genai";

const ENHANCEMENT_PROMPT = `TASK: Professional photo retouch. Intensity level: 4-5 out of 10.

HARD CONSTRAINTS (never violate):
- Person must be 100% recognizable as themselves
- Keep exact same: angle, pose, expression, framing
- No additions: no jewelry, accessories, makeup, or items not already present
- No major structural changes to face shape or bone structure
- Keep natural skin texture visible (don't over-smooth)

REQUIRED IMPROVEMENTS (always apply these):
□ HAIR: Make hair look groomed, neat, and well-styled. Add natural volume and fullness. Clear flyaways and messy strands. If thinning, fill in naturally. Keep original color and style.
□ FACIAL HAIR: Clean up beard and mustache edges. Make it look freshly trimmed and groomed. Remove patchy spots. Keep the style intact.
□ SKIN: Clear blemishes, reduce dark circles, even skin tone, add healthy glow.
□ EYES: Brighten whites, enhance catchlights, make eyes look alert and vibrant.

BACKGROUND & LIGHTING FIXES (always apply):
□ Remove lens flares, light leaks, and harsh glare
□ Clean up distracting background elements
□ Balance harsh shadows on face
□ PRESERVE original colors - only subtle corrections, no heavy color grading

OPTIONAL (apply if beneficial):
□ Subtle jawline refinement if asymmetric
□ Minor eyebrow grooming

EXPRESSION: Keep the current expression. Do not add or change smile.

OUTPUT: Generate the retouched image.`;

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
