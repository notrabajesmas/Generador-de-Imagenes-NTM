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

// Using Pollinations.ai - FREE, no API key needed, unlimited
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

    const [width, height] = imageSize.split('x').map(Number);

    console.log('[API] Starting image generation with Pollinations.ai...');
    console.log('[API] Prompt:', prompt.trim());
    console.log('[API] Size:', width, 'x', height);

    // Build the Pollinations.ai URL
    // This service is completely FREE, no API key needed
    const encodedPrompt = encodeURIComponent(prompt.trim());
    const seed = Math.floor(Math.random() * 1000000);
    
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&enhance=true`;

    console.log('[API] Fetching image from:', imageUrl);

    // Fetch the image
    const response = await fetch(imageUrl, {
      method: 'GET',
      headers: {
        'Accept': 'image/*',
      },
    });

    if (!response.ok) {
      console.error('[API] Failed to fetch image:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Error al generar la imagen: ${response.status}` },
        { status: 500 }
      );
    }

    // Convert to base64
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    console.log('[API] Image generated successfully, size:', base64.length, 'bytes');

    return NextResponse.json({
      success: true,
      image: base64,
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
