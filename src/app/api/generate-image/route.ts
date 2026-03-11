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

// Fetch image with timeout
async function fetchImage(url: string, timeoutMs = 55000): Promise<{ success: boolean; data?: ArrayBuffer; error?: string }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    console.log(`[API] Fetching: ${url.substring(0, 120)}...`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'image/*' },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.log(`[API] HTTP ${response.status}: ${errorText.substring(0, 200)}`);
      return { success: false, error: `HTTP ${response.status}` };
    }
    
    const arrayBuffer = await response.arrayBuffer();
    
    // Check if we got an actual image (not an error JSON)
    if (arrayBuffer.byteLength < 1000) {
      console.log(`[API] Response too small: ${arrayBuffer.byteLength} bytes`);
      return { success: false, error: 'Response too small' };
    }
    
    return { success: true, data: arrayBuffer };
  } catch (err) {
    clearTimeout(timeoutId);
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.log(`[API] Fetch error: ${errorMsg}`);
    return { success: false, error: errorMsg };
  }
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

    console.log('[API] ========================================');
    console.log('[API] Starting image generation');
    console.log('[API] Prompt:', prompt.trim());
    console.log('[API] Size:', width, 'x', height);

    const cleanPrompt = prompt.trim();
    const encodedPrompt = encodeURIComponent(cleanPrompt);
    const seed = Math.floor(Math.random() * 999999999);

    // Pollinations.ai - 100% FREE, no API key, no limits
    // Multiple models to try (in order of preference)
    const endpoints = [
      // Flux - Fast and reliable (PRIMARY)
      { name: 'Flux', url: `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=flux&nologo=true` },
      // Flux with enhancement
      { name: 'Flux Enhanced', url: `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=flux&nologo=true&enhance=true` },
      // Flux Dev (slower but higher quality)
      { name: 'Flux Dev', url: `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=flux-dev&nologo=true` },
      // Flux 2 Dev
      { name: 'Flux 2 Dev', url: `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=flux-2-dev&nologo=true` },
      // Default model (backup)
      { name: 'Default', url: `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true` },
    ];

    // Try each endpoint
    for (let i = 0; i < endpoints.length; i++) {
      console.log(`[API] Trying ${endpoints[i].name} (${i + 1}/${endpoints.length})...`);
      
      const result = await fetchImage(endpoints[i].url, 50000);
      
      if (result.success && result.data) {
        const base64 = Buffer.from(result.data).toString('base64');
        console.log(`[API] SUCCESS with ${endpoints[i].name}! Image size: ${base64.length} bytes`);
        console.log('[API] ========================================');
        
        return NextResponse.json({
          success: true,
          image: base64,
          prompt: prompt.trim(),
          size: imageSize
        });
      }
      
      console.log(`[API] ${endpoints[i].name} failed: ${result.error}`);
      
      // Small delay between attempts
      if (i < endpoints.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // All endpoints failed
    console.log('[API] All endpoints failed');
    console.log('[API] ========================================');
    
    return NextResponse.json(
      { 
        error: 'El servicio está temporalmente no disponible. Por favor intenta de nuevo en unos momentos.'
      },
      { status: 503 }
    );

  } catch (error: unknown) {
    console.error('[API] Unexpected error:', error);
    
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
