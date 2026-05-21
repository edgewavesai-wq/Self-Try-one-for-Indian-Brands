import { NextRequest, NextResponse } from 'next/server';
import { buildPrompt } from '@/lib/prompt-builder';

export const maxDuration = 60;

async function fileToBlob(file: File): Promise<Blob> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return new Blob([buffer], { type: file.type || 'image/jpeg' });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const userPhoto = formData.get('userPhoto') as File | null;
    const fabricPhoto = formData.get('fabricPhoto') as File | null;
    const styleRefPhoto = formData.get('styleRefPhoto') as File | null;
    const selectionsRaw = formData.get('selections') as string;

    if (!userPhoto) return NextResponse.json({ error: 'User photo is required' }, { status: 400 });
    if (!selectionsRaw) return NextResponse.json({ error: 'Selections are required' }, { status: 400 });

    const selections = JSON.parse(selectionsRaw);
    const prompt = buildPrompt(selections);

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });

    // Build multipart form for images/edits — send reference images in order:
    // [0] person photo (always), [1] fabric reference (if provided), [2] style reference (if provided)
    const editForm = new FormData();
    editForm.append('image[]', await fileToBlob(userPhoto), 'person.jpg');
    if (fabricPhoto) editForm.append('image[]', await fileToBlob(fabricPhoto), 'fabric.jpg');
    if (styleRefPhoto) editForm.append('image[]', await fileToBlob(styleRefPhoto), 'style.jpg');
    editForm.append('prompt', prompt);
    editForm.append('model', 'gpt-image-1');
    editForm.append('n', '1');
    editForm.append('size', '1024x1536');
    if (selections.quality) editForm.append('quality', selections.quality);

    const editRes = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: editForm,
    });

    // Fallback to generations endpoint if edits fails (e.g. format mismatch)
    if (!editRes.ok) {
      const genRes = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'gpt-image-1',
          prompt,
          n: 1,
          size: '1024x1536',
          quality: selections.quality || 'medium',
        }),
      });

      const genData = await genRes.json();
      if (!genRes.ok) {
        return NextResponse.json(
          { error: genData.error?.message || 'Generation failed' },
          { status: genRes.status },
        );
      }

      return NextResponse.json({
        image: extractImage(genData.data?.[0]),
        prompt,
        cost: costFor(selections.quality),
      });
    }

    const editData = await editRes.json();
    return NextResponse.json({
      image: extractImage(editData.data?.[0]),
      prompt,
      cost: costFor(selections.quality),
    });
  } catch (error: unknown) {
    console.error('Generate error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    );
  }
}

function extractImage(item: { url?: string; b64_json?: string } | undefined): string | null {
  if (!item) return null;
  return item.url || (item.b64_json ? `data:image/png;base64,${item.b64_json}` : null);
}

function costFor(quality?: string): number {
  if (quality === 'low') return 0.006;
  if (quality === 'high') return 0.211;
  return 0.053;
}
