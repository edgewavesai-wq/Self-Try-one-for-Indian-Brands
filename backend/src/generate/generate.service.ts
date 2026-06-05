import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { buildPrompt, getCostEstimate, Selections } from './prompt-builder';

const MODEL = 'gpt-image-2';
const SIZE = '1024x1024';
const FORMAT = 'jpeg';
const COMPRESS = '80';

@Injectable()
export class GenerateService {
  private readonly apiKey = process.env.OPENAI_API_KEY;

  async generate(
    userPhoto: Express.Multer.File,
    fabricPhoto: Express.Multer.File | undefined,
    styleRefPhoto: Express.Multer.File | undefined,
    selections: Selections,
  ) {
    if (!this.apiKey) {
      throw new InternalServerErrorException('OpenAI API key not configured');
    }

    const quality = selections.quality || 'high';
    const hasFabricImage = !!fabricPhoto;
    const hasStyleRefImage = !!styleRefPhoto;

    const prompt = buildPrompt({ ...selections, hasFabricImage, hasStyleRefImage });

    const userBlob = new Blob([new Uint8Array(userPhoto.buffer)], { type: userPhoto.mimetype || 'image/jpeg' });
    const fabricBlob = fabricPhoto
      ? new Blob([new Uint8Array(fabricPhoto.buffer)], { type: fabricPhoto.mimetype || 'image/jpeg' })
      : null;

    const editFormData = new FormData();

    if (fabricBlob) {
      editFormData.append('image[]', userBlob, 'person.jpg');
      editFormData.append('image[]', fabricBlob, 'fabric.jpg');
    } else {
      editFormData.append('image', userBlob, 'person.jpg');
    }

    editFormData.append('prompt', prompt);
    editFormData.append('model', MODEL);
    editFormData.append('n', '1');
    editFormData.append('size', SIZE);
    editFormData.append('quality', quality);
    editFormData.append('output_format', FORMAT);
    editFormData.append('output_compression', COMPRESS);

    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}` },
      body: editFormData,
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      console.warn('Edits endpoint failed:', errBody?.error?.message);

      // Fallback to generations endpoint
      const genRes = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}` },
        body: JSON.stringify({
          model: MODEL,
          prompt,
          n: 1,
          size: SIZE,
          quality,
          output_format: FORMAT,
          output_compression: parseInt(COMPRESS),
        }),
      });

      const genData = await genRes.json();
      if (!genRes.ok) {
        throw new InternalServerErrorException(genData.error?.message || 'Generation failed');
      }

      const img = genData.data?.[0];
      return {
        image: img?.url || (img?.b64_json ? `data:image/jpeg;base64,${img.b64_json}` : null),
        prompt,
        cost: getCostEstimate(quality),
        usage: genData.usage ?? null,
      };
    }

    const data = await response.json();
    const img = data.data?.[0];

    return {
      image: img?.url || (img?.b64_json ? `data:image/jpeg;base64,${img.b64_json}` : null),
      prompt,
      cost: getCostEstimate(quality),
      usage: data.usage ?? null,
    };
  }
}
