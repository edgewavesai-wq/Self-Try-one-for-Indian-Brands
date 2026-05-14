import { NextRequest, NextResponse } from 'next/server';
import { buildPrompt } from '@/lib/prompt-builder';

export const maxDuration = 60;

async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer.toString('base64');
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const userPhoto = formData.get('userPhoto') as File | null;
    const selectionsRaw = formData.get('selections') as string;

    if (!userPhoto) {
      return NextResponse.json({ error: 'User photo is required' }, { status: 400 });
    }

    if (!selectionsRaw) {
      return NextResponse.json({ error: 'Selections are required' }, { status: 400 });
    }

    const selections = JSON.parse(selectionsRaw);
    const prompt = buildPrompt(selections);

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    // Convert user photo to base64
    const userPhotoBase64 = await fileToBase64(userPhoto);
    const userPhotoMediaType = userPhoto.type || 'image/jpeg';

    // Use the images/edits endpoint for image+prompt → new image
    // Build a multipart form for the edits API
    const editFormData = new FormData();

    // Convert base64 back to blob for the API
    const userPhotoBlob = new Blob(
      [Buffer.from(userPhotoBase64, 'base64')],
      { type: userPhotoMediaType }
    );
    editFormData.append('image', userPhotoBlob, 'user-photo.jpg');
    editFormData.append('prompt', prompt);
    editFormData.append('model', 'gpt-image-1');
    editFormData.append('n', '1');
    editFormData.append('size', '1024x1536');

    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: editFormData,
    });

    // Fallback to generations endpoint if edits fails
    if (!response.ok) {
      const genResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-image-1',
          prompt: prompt,
          n: 1,
          size: '1024x1536',
          quality: selections.quality || 'medium',
        }),
      });

      const genData = await genResponse.json();

      if (!genResponse.ok) {
        return NextResponse.json(
          { error: genData.error?.message || 'Generation failed' },
          { status: genResponse.status }
        );
      }

      const imageData = genData.data?.[0];
      return NextResponse.json({
        image: imageData?.url || (imageData?.b64_json ? `data:image/png;base64,${imageData.b64_json}` : null),
        prompt,
        cost: selections.quality === 'low' ? 0.006 : selections.quality === 'high' ? 0.211 : 0.053,
      });
    }

    const data = await response.json();
    const imageData = data.data?.[0];

    return NextResponse.json({
      image: imageData?.url || (imageData?.b64_json ? `data:image/png;base64,${imageData.b64_json}` : null),
      prompt,
      cost: selections.quality === 'low' ? 0.006 : selections.quality === 'high' ? 0.211 : 0.053,
    });
  } catch (error: unknown) {
    console.error('Generate error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
