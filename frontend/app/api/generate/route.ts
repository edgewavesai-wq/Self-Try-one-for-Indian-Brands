import { NextRequest, NextResponse } from 'next/server';
import { buildPrompt, getCostEstimate } from '@/lib/prompt-builder';

export const maxDuration = 60;

const MODEL    = 'gpt-image-2';
const SIZE     = '1024x1024';
const FORMAT   = 'jpeg';
const COMPRESS = '80';

export async function POST(req: NextRequest) {
  try {
    const formData        = await req.formData();
    const userPhoto       = formData.get('userPhoto')     as File | null;
    const selectionsRaw   = formData.get('selections')    as string;
    const fabricPhotoFile = formData.get('fabricPhoto')   as File | null;
    const styleRefFile    = formData.get('styleRefPhoto') as File | null;

    if (!userPhoto)     return NextResponse.json({ error: 'User photo is required' },  { status: 400 });
    if (!selectionsRaw) return NextResponse.json({ error: 'Selections are required' }, { status: 400 });

    const selections = JSON.parse(selectionsRaw);
    const quality: 'low' | 'medium' | 'high' = selections.quality || 'high';

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });

    const hasFabricImage  = !!fabricPhotoFile;
    const hasStyleRefImage = !!styleRefFile;

    // Build prompt — no vision text conversion, images are passed directly
    const prompt = buildPrompt({
      ...selections,
      hasFabricImage,
      hasStyleRefImage,
    });

    // ── Prepare blobs ────────────────────────────────────────────────────────
    const userBlob = new Blob(
      [Buffer.from(await userPhoto.arrayBuffer())],
      { type: userPhoto.type || 'image/jpeg' }
    );

    const fabricBlob = fabricPhotoFile
      ? new Blob(
          [Buffer.from(await fabricPhotoFile.arrayBuffer())],
          { type: fabricPhotoFile.type || 'image/jpeg' }
        )
      : null;

    // ── Build multipart form for edits endpoint ──────────────────────────────
    const editFormData = new FormData();

    if (fabricBlob) {
      // Pass both images directly — model sees person AND fabric visually
      // image[] is the correct array field name for gpt-image-2 edits
      editFormData.append('image[]', userBlob,   'person.jpg');
      editFormData.append('image[]', fabricBlob, 'fabric.jpg');
    } else {
      editFormData.append('image', userBlob, 'person.jpg');
    }

    editFormData.append('prompt',             prompt);
    editFormData.append('model',              MODEL);
    editFormData.append('n',                  '1');
    editFormData.append('size',               SIZE);
    editFormData.append('quality',            quality);
    editFormData.append('output_format',      FORMAT);
    editFormData.append('output_compression', COMPRESS);

    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: editFormData,
    });

    // ── Fallback: generations endpoint ───────────────────────────────────────
    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      console.warn('Edits failed:', errBody?.error?.message);

      const genRes = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model:              MODEL,
          prompt,
          n:                  1,
          size:               SIZE,
          quality,
          output_format:      FORMAT,
          output_compression: parseInt(COMPRESS),
        }),
      });

      const genData = await genRes.json();
      if (!genRes.ok) {
        return NextResponse.json(
          { error: genData.error?.message || 'Generation failed' },
          { status: genRes.status }
        );
      }

      const img = genData.data?.[0];
      return NextResponse.json({
        image: img?.url || (img?.b64_json ? `data:image/jpeg;base64,${img.b64_json}` : null),
        prompt,
        cost:  getCostEstimate(quality),
        usage: genData.usage ?? null,
      });
    }

    const data = await response.json();
    const img  = data.data?.[0];

    return NextResponse.json({
      image: img?.url || (img?.b64_json ? `data:image/png;base64,${img.b64_json}` : null),
      prompt,
      cost:  getCostEstimate(quality),
      usage: data.usage ?? null,
    });

  } catch (error: unknown) {
    console.error('Generate error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
