export interface Selections {
  kurtaStyle: { promptKeywords: string; name: string };
  neckline: { prompt: string; name: string };
  sleeve: { prompt: string; name: string };
  embellishment: { prompt: string; name: string };
  fabricPrompt: string;
  fabricName: string;
  bottomWear?: string;
  quality?: 'low' | 'medium' | 'high';
  /** True when fabric photo is passed directly as Image 2 to the API */
  hasFabricImage?: boolean;
  /** True when a style reference photo is also passed */
  hasStyleRefImage?: boolean;
}

export function buildPrompt(selections: Selections): string {
  const { hasFabricImage, hasStyleRefImage } = selections;
  const bottom = selections.bottomWear || 'matching churidar pants';
  const style  = selections.kurtaStyle.promptKeywords;

  const PRESERVE = `KEEP IDENTICAL — do not change anything below:
Face · Skin tone · Beard · Hair · Exact pose · Hand positions · Body angle · Feet position · Background · Scene · Lighting · Shadows · Camera angle · All accessories (watch, chain, bracelet)`;

  const DESIGN = `KURTA DESIGN:
• Style: ${style}
• Neckline: ${selections.neckline.prompt}
• Sleeves: ${selections.sleeve.prompt}
• Embellishment: ${selections.embellishment.prompt}
• Bottom wear: ${bottom}
• Garment tailored and fitted to the person's exact body shape
• Fabric drapes naturally with realistic weight, folds, and creases`;

  /* ─── Both person + fabric images passed directly to API ─────────────────── */
  if (hasFabricImage) {
    return `Clothing replacement task. Change ONLY the garment. Keep everything else identical.

IMAGES:
• Image 1 — Person photo. This is the base. Preserve it completely except the clothing.
• Image 2 — Fabric swatch. The kurta must use this exact fabric.

TASK: Replace the shirt in Image 1 with an Indian kurta sewn from the fabric in Image 2.

FABRIC ACCURACY (highest priority — reference Image 2 directly):
• Match exact colours, woven pattern, motifs, and layout from Image 2
• Match exact surface finish — metallic zari thread sheen, embossed texture, fabric weight
• Woven brocade appearance — NOT a flat digital print
• Pattern repeats continuously across chest, sleeves, and all panels
• Metallic threads catch the light naturally as it exists in Image 1

${DESIGN}

${PRESERVE}`.trim();
  }

  /* ─── Only person photo — use preset fabric text ─────────────────────────── */
  return `Clothing replacement task. Change ONLY the garment. Keep everything else identical.

IMAGE: Person photo. This is the base. Preserve it completely except the clothing.

TASK: Replace the shirt with an Indian kurta.

FABRIC:
${selections.fabricPrompt}
Pattern repeats correctly across all panels and natural folds. Woven texture — not a flat print.

${DESIGN}

${PRESERVE}`.trim();
}

export function getCostEstimate(quality: 'low' | 'medium' | 'high'): number {
  // gpt-image-2 at 1024x1024 — output $30/1M tokens, input $8/1M tokens
  const costs = { low: 0.008, medium: 0.031, high: 0.125 };
  return costs[quality];
}
