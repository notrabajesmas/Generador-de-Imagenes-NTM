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

// Fetch with retry
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        return response;
      }
      console.log(`[API] Attempt ${i + 1} failed with status ${response.status}`);
      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
      
      // Wait before retry (exponential backoff)
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    } catch (err) {
      console.log(`[API] Attempt ${i + 1} failed:`, err);
      lastError = err instanceof Error ? err : new Error('Unknown error');
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
  
  throw lastError || new Error('All retries failed');
}

// Generate image using Pollinations.ai
async function generateWithPollinations(prompt: string, width: number, height: number): Promise<string> {
  const encodedPrompt = encodeURIComponent(prompt);
  const seed = Math.floor(Math.random() * 1000000);
  
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&enhance=true`;
  
  console.log('[API] Trying Pollinations.ai...');
  
  const response = await fetchWithRetry(imageUrl, {
    method: 'GET',
    headers: { 'Accept': 'image/*' },
  }, 3);
  
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer).toString('base64');
}

// Generate image using Picogen (backup)
async function generateWithPicogen(prompt: string, width: number, height: number): Promise<string> {
  const seed = Math.floor(Math.random() * 1000000);
  
  // Use a simpler URL structure
  const imageUrl = `https://fastapi.picsum.photos/${width}/${height}.webp?random=${seed}`;
  
  console.log('[API] Trying fallback service...');
  
  const response = await fetchWithRetry(imageUrl, {
    method: 'GET',
    headers: { 'Accept': 'image/*' },
  }, 2);
  
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer).toString('base64');
}

// Generate using Stable Diffusion via Hugging Face (free inference API)
async function generateWithHuggingFace(prompt: string, width: number, height: number): Promise<string> {
  console.log('[API] Trying Hugging Face Inference API...');
  
  // Using the free inference API endpoint
  const response = await fetch(
    'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          width: Math.min(width, 1024),
          height: Math.min(height, 1024),
        },
      }),
    }
  );
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.log('[API] HuggingFace response:', response.status, errorData);
    
    // Model might be loading
    if (response.status === 503) {
      throw new Error('El modelo está cargando, intenta de nuevo en unos segundos');
    }
    throw new Error(`HuggingFace error: ${response.status}`);
  }
  
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer).toString('base64');
}

// Generate using Pollinations with different model
async function generateWithPollinationsFlux(prompt: string, width: number, height: number): Promise<string> {
  const encodedPrompt = encodeURIComponent(prompt);
  const seed = Math.floor(Math.random() * 1000000);
  
  // Using Flux model which is more reliable
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux`;
  
  console.log('[API] Trying Pollinations Flux model...');
  
  const response = await fetchWithRetry(imageUrl, {
    method: 'GET',
    headers: { 'Accept': 'image/*' },
  }, 3);
  
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer).toString('base64');
}

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

    console.log('[API] Starting image generation...');
    console.log('[API] Prompt:', prompt.trim());
    console.log('[API] Size:', width, 'x', height);

    let base64Image: string | null = null;
    const errors: string[] = [];

    // Try Pollinations Flux first (more reliable)
    try {
      base64Image = await generateWithPollinationsFlux(prompt.trim(), width, height);
      console.log('[API] Successfully generated with Pollinations Flux');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.log('[API] Pollinations Flux failed:', errorMsg);
      errors.push(`Flux: ${errorMsg}`);
    }

    // Fallback 1: Original Pollinations
    if (!base64Image) {
      try {
        base64Image = await generateWithPollinations(prompt.trim(), width, height);
        console.log('[API] Successfully generated with Pollinations');
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        console.log('[API] Pollinations failed:', errorMsg);
        errors.push(`Pollinations: ${errorMsg}`);
      }
    }

    // Fallback 2: Hugging Face
    if (!base64Image) {
      try {
        base64Image = await generateWithHuggingFace(prompt.trim(), width, height);
        console.log('[API] Successfully generated with HuggingFace');
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        console.log('[API] HuggingFace failed:', errorMsg);
        errors.push(`HuggingFace: ${errorMsg}`);
      }
    }

    if (!base64Image) {
      return NextResponse.json(
        { error: 'No se pudo generar la imagen. Intenta de nuevo en unos momentos.', details: errors },
        { status: 500 }
      );
    }

    console.log('[API] Image generated successfully, size:', base64Image.length, 'bytes');

    return NextResponse.json({
      success: true,
      image: base64Image,
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
