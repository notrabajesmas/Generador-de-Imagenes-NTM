import ZAI from 'z-ai-web-dev-sdk';
import { NextResponse } from 'next/server';

// Set max duration for serverless functions (Vercel)
export const maxDuration = 60;

const VALID_SIZES = [
  '1024x1024',
  '768x1344',
  '864x1152',
  '1344x768',
  '1152x864',
  '1440x720',
  '720x1440'
] as const;

type ImageSize = typeof VALID_SIZES[number];

export async function POST(request: Request) {
  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    const { prompt, size = '1024x1024' } = body;

    // Validate prompt
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'El prompt es requerido' },
        { status: 400 }
      );
    }

    // Validate size
    const imageSize: ImageSize = VALID_SIZES.includes(size as ImageSize) 
      ? (size as ImageSize) 
      : '1024x1024';

    console.log('[API] Starting image generation...');

    // Initialize SDK
    const zai = await ZAI.create();
    console.log('[API] SDK initialized');
    
    // Generate image
    const response = await zai.images.generations.create({
      prompt: prompt.trim(),
      size: imageSize
    });
    console.log('[API] Image generation complete');

    const imageBase64 = response.data[0]?.base64;

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'No se pudo generar la imagen' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      image: imageBase64,
      prompt: prompt.trim(),
      size: imageSize
    });

  } catch (error: unknown) {
    console.error('[API] Error:', error);
    
    let errorMessage = 'Error desconocido';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
