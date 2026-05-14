export interface Selections {
  kurtaStyle: { promptKeywords: string; name: string };
  neckline: { prompt: string; name: string };
  sleeve: { prompt: string; name: string };
  embellishment: { prompt: string; name: string };
  fabricPrompt: string;
  fabricName: string;
  bottomWear?: string;
  quality?: 'low' | 'medium' | 'high';
}

export function buildPrompt(selections: Selections): string {
  return `TASK: Generate a photorealistic fashion photograph of the person from the reference photo wearing a custom-designed Indian kurta.

CRITICAL INSTRUCTIONS:
- The person's FACE, BODY TYPE, SKIN TONE, and HAIR must match the reference photo EXACTLY
- The person should be standing in a natural, confident pose
- Studio lighting, neutral grey/cream background
- Fashion editorial photography style, sharp focus, 85mm lens, soft shadows
- Full body or 3/4 body shot, portrait orientation
- Single person only, no other people in frame

KURTA DESIGN SPECIFICATIONS:
- Style: ${selections.kurtaStyle.promptKeywords}
- Neckline: ${selections.neckline.prompt}
- Sleeves: ${selections.sleeve.prompt}
- Fabric: ${selections.fabricPrompt}
- Embellishment: ${selections.embellishment.prompt}
- Bottom wear: ${selections.bottomWear || 'matching churidar pants'}

The kurta should look TAILORED and FITTED to the person's body. The fabric texture, draping, and embellishments must look photorealistic and physically accurate. Fabric drapes naturally with realistic folds and shadows.`.trim();
}

export function getCostEstimate(quality: 'low' | 'medium' | 'high'): number {
  const costs = { low: 0.006, medium: 0.053, high: 0.211 };
  return costs[quality];
}
