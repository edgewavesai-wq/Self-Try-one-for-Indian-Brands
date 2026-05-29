export interface Selections {
  kurtaStyle: { promptKeywords: string; name: string };
  neckline: { prompt: string; name: string };
  sleeve: { prompt: string; name: string };
  embellishment: { prompt: string; name: string };
  fabricPrompt: string;
  fabricName: string;
  bottomWear?: string;
  quality?: 'low' | 'medium' | 'high';
  hasFabricPhoto?: boolean;
  hasStyleRefPhoto?: boolean;
}

export function buildPrompt(selections: Selections): string {
  const imageCount = 1 + (selections.hasFabricPhoto ? 1 : 0) + (selections.hasStyleRefPhoto ? 1 : 0);

  const fabricLine = selections.hasFabricPhoto
    ? `- Fabric: Reproduce the exact fabric texture, weave, pattern, and colour shown in image ${imageCount === 3 ? 2 : 2} (fabric reference)`
    : `- Fabric: ${selections.fabricPrompt}`;

  const styleLine = selections.hasStyleRefPhoto
    ? `- Style: Faithfully replicate the kurta silhouette, cut, and drape shown in the style reference image (last uploaded image)`
    : `- Style: ${selections.kurtaStyle.promptKeywords}`;

  return `TASK: Generate a photorealistic fashion photograph of the person from image 1 (the person reference) wearing a custom-designed Indian kurta.

CRITICAL INSTRUCTIONS:
- The person's FACE, BODY TYPE, SKIN TONE, and HAIR must match image 1 EXACTLY
- Natural, confident standing pose
- Studio lighting, neutral grey/cream background
- Fashion editorial photography style, sharp focus, 85mm lens, soft shadows
- Full body or 3/4 body shot, portrait orientation
- Single person only, no other people in frame

KURTA DESIGN SPECIFICATIONS:
${styleLine}
- Neckline: ${selections.neckline.prompt}
- Sleeves: ${selections.sleeve.prompt}
${fabricLine}
- Embellishment: ${selections.embellishment.prompt}
- Bottom wear: ${selections.bottomWear || 'matching churidar pants'}

The kurta must look TAILORED and FITTED to the person's body. Fabric texture, draping, and embellishments must be photorealistic and physically accurate with natural folds and shadows.`.trim();
}

export function getCostEstimate(quality: 'low' | 'medium' | 'high'): number {
  // gpt-image-2 at 1024×1024 (low/medium) and 1024×1536 (high only)
  const costs = { low: 0.006, medium: 0.042, high: 0.167 };
  return costs[quality];
}
