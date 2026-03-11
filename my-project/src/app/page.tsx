'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Sparkles, 
  Download, 
  Loader2, 
  Image as ImageIcon, 
  Trash2,
  Wand2,
  Expand,
  X,
  History,
  AlertCircle,
  Palette,
  Share2,
  Copy,
  Check,
  Twitter,
  Facebook,
  Instagram,
  Zap
} from 'lucide-react';

// Image sizes available
const IMAGE_SIZES = [
  { value: '1024x1024', label: 'Cuadrado (1024×1024)', description: 'Ideal para posts' },
  { value: '768x1344', label: 'Vertical (768×1344)', description: 'Stories, Reels' },
  { value: '864x1152', label: 'Retrato (864×1152)', description: 'Posts verticales' },
  { value: '1344x768', label: 'Paisaje (1344×768)', description: 'Banners, headers' },
  { value: '1152x864', label: 'Apaisado (1152×864)', description: 'Presentaciones' },
  { value: '1440x720', label: 'Panorámico (1440×720)', description: 'Covers, YouTube' },
  { value: '720x1440', label: 'Móvil (720×1440)', description: 'Wallpapers' },
] as const;

// Artistic styles
const ART_STYLES = [
  { value: 'none', label: 'Sin estilo específico', suffix: '' },
  { value: 'realistic', label: '📸 Realista', suffix: ', photorealistic, ultra detailed, professional photography' },
  { value: 'anime', label: '🎌 Anime / Manga', suffix: ', anime style, manga art, vibrant colors, clean lines' },
  { value: 'digital-art', label: '🎨 Arte Digital', suffix: ', digital art, concept art, artstation trending' },
  { value: 'oil-painting', label: '🖼️ Pintura al Óleo', suffix: ', oil painting, classical art style, rich textures, masterpiece' },
  { value: 'watercolor', label: '💧 Acuarela', suffix: ', watercolor painting, soft colors, artistic, dreamy' },
  { value: '3d-render', label: '🎮 3D Render', suffix: ', 3D render, octane render, unreal engine 5, highly detailed' },
  { value: 'cyberpunk', label: '🌃 Cyberpunk', suffix: ', cyberpunk style, neon lights, futuristic, dark atmosphere' },
  { value: 'fantasy', label: '🧙 Fantasía', suffix: ', fantasy art, magical, ethereal, epic composition' },
  { value: 'minimalist', label: '⚪ Minimalista', suffix: ', minimalist style, clean design, simple composition' },
  { value: 'pixel-art', label: '👾 Pixel Art', suffix: ', pixel art style, 16-bit, retro game aesthetic' },
  { value: 'sketch', label: '✏️ Boceto/Lápiz', suffix: ', pencil sketch, hand drawn, artistic sketch style' },
] as const;

// Quality levels
const QUALITY_LEVELS = [
  { value: 'standard', label: '📺 Estándar', suffix: '' },
  { value: 'hd', label: '🖥️ HD', suffix: ', high definition, sharp details' },
  { value: '2k', label: '🎥 2K', suffix: ', 2K resolution, crisp details, high quality' },
  { value: '4k', label: '🎬 4K Ultra HD', suffix: ', 4K, ultra high definition, extremely detailed, sharp focus' },
  { value: '8k', label: '🌟 8K Master', suffix: ', 8K, masterpiece, extremely detailed, hyperrealistic, ultra sharp' },
] as const;

// Number of images to generate
const IMAGE_COUNTS = [
  { value: '1', label: '1 imagen' },
  { value: '2', label: '2 imágenes' },
  { value: '3', label: '3 imágenes' },
  { value: '4', label: '4 imágenes' },
] as const;

interface GeneratedImage {
  id: string;
  prompt: string;
  originalPrompt: string;
  size: string;
  style: string;
  quality: string;
  image: string;
  createdAt: string;
}

const STORAGE_KEY = 'ntm_generator_history';
const MAX_HISTORY = 30;
const APP_NAME = 'Generador de Imágenes NTM';

// Helper to safely check if localStorage is available
const isLocalStorageAvailable = (): boolean => {
  try {
    if (typeof window === 'undefined') return false;
    const testKey = '__test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<string>('1024x1024');
  const [style, setStyle] = useState<string>('none');
  const [quality, setQuality] = useState<string>('standard');
  const [imageCount, setImageCount] = useState<string>('1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const resultRef = useRef<HTMLDivElement>(null);

  // Hydration: load history from localStorage after mount
  useEffect(() => {
    setIsMounted(true);
    const available = isLocalStorageAvailable();
    setStorageAvailable(available);
    
    if (available) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setHistory(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Error loading history:', e);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    if (isMounted && storageAvailable) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      } catch (e) {
        console.error('Error saving history:', e);
      }
    }
  }, [history, isMounted, storageAvailable]);

  const getFinalPrompt = (basePrompt: string, selectedStyle: string, selectedQuality: string): string => {
    let finalPrompt = basePrompt.trim();
    
    const styleData = ART_STYLES.find(s => s.value === selectedStyle);
    if (styleData && styleData.suffix) {
      finalPrompt += styleData.suffix;
    }
    
    const qualityData = QUALITY_LEVELS.find(q => q.value === selectedQuality);
    if (qualityData && qualityData.suffix) {
      finalPrompt += qualityData.suffix;
    }
    
    return finalPrompt;
  };

  // Check if API is available
  const checkApiHealth = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/health', { 
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  const generateImages = async () => {
    if (!prompt.trim() || isGenerating) return;

    // First check if API is available
    const apiAvailable = await checkApiHealth();
    if (!apiAvailable) {
      setError('⚠️ El servidor está iniciando. Espera unos segundos e intenta de nuevo.');
      return;
    }

    const count = parseInt(imageCount);
    const finalPrompt = getFinalPrompt(prompt, style, quality);
    
    setIsGenerating(true);
    setError(null);
    setGeneratedImages([]);
    setCurrentPrompt(finalPrompt);

    const newImages: string[] = [];
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    try {
      // Generate images sequentially
      for (let i = 0; i < count; i++) {
        try {
          const response = await fetch('/api/generate-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              prompt: finalPrompt,
              size,
            }),
            signal: controller.signal,
          });

          const data = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(data.error || 'Error al generar la imagen');
          }

          newImages.push(data.image);
          setGeneratedImages([...newImages]);
          
        } catch (err) {
          if (err instanceof Error && err.name === 'AbortError') {
            throw new Error('La generación tardó demasiado');
          }
          console.error(`Error generating image ${i + 1}:`, err);
        }
      }

      clearTimeout(timeoutId);

      if (newImages.length === 0) {
        throw new Error('No se pudo generar ninguna imagen');
      }

      // Add to history
      const historyEntries: GeneratedImage[] = newImages.map((img, idx) => ({
        id: `${Date.now()}-${idx}`,
        prompt: finalPrompt,
        originalPrompt: prompt.trim(),
        size,
        style,
        quality,
        image: img,
        createdAt: new Date().toISOString(),
      }));
      
      setHistory(prev => [...historyEntries, ...prev].slice(0, MAX_HISTORY));

      // Scroll to result
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);

    } catch (err) {
      clearTimeout(timeoutId);
      console.error('Generation error:', err);
      
      let errorMessage = 'Error desconocido';
      if (err instanceof Error) {
        if (err.message === 'Failed to fetch') {
          errorMessage = 'Error de conexión. El servidor puede estar reiniciando, espera unos segundos e intenta de nuevo.';
        } else {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = (imageData: string, filename: string) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${imageData}`;
    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllImages = () => {
    generatedImages.forEach((img, idx) => {
      setTimeout(() => {
        downloadImage(img, `ntm-${Date.now()}-${idx + 1}`);
      }, idx * 500);
    });
  };

  const clearHistory = () => {
    setHistory([]);
    if (storageAvailable) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        console.error('Error clearing history:', e);
      }
    }
  };

  const deleteFromHistory = (id: string) => {
    setHistory(prev => prev.filter(img => img.id !== id));
  };

  // Share functions
  const shareOnTwitter = (sharePrompt: string) => {
    const text = encodeURIComponent(`¡Mira esta imagen que creé con ${APP_NAME}!\n\n"${sharePrompt.substring(0, 100)}..."`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const shareOnFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const shareOnInstagram = () => {
    // Instagram doesn't have a direct share URL, open Instagram
    window.open('https://www.instagram.com/', '_blank');
  };

  const shareOnWhatsApp = (sharePrompt: string) => {
    const text = encodeURIComponent(`¡Mira esta imagen que creé con ${APP_NAME}!\n\n"${sharePrompt.substring(0, 100)}..."\n\n${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const copyPromptToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const examplePrompts = [
    { text: 'Un gato astronauta flotando en el espacio', style: 'digital-art', quality: '4k' },
    { text: 'Paisaje cyberpunk de Tokio por la noche', style: 'cyberpunk', quality: '4k' },
    { text: 'Retrato de una mujer con flores en el cabello', style: 'watercolor', quality: 'hd' },
    { text: 'Castillo mágico flotando entre las nubes', style: 'fantasy', quality: '4k' },
    { text: 'Un dragón de cristal sobre una montaña nevada', style: '3d-render', quality: '8k' },
    { text: 'Samurai en un jardín japonés con cerezos', style: 'anime', quality: '2k' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25">
              <Wand2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              {APP_NAME}
            </h1>
          </div>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Transforma tus ideas en imágenes increíbles con inteligencia artificial. 
            Escribe tu prompt, elige estilo y calidad, y deja que la magia comience.
          </p>
        </header>

        {/* Main Input Area */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 md:p-8 mb-8 shadow-2xl">
          <div className="space-y-6">
            {/* Prompt Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Describe tu imagen
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ej: Un dragón de cristal sobre una montaña nevada al atardecer..."
                className="min-h-[120px] bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-500 focus:border-purple-500/50 focus:ring-purple-500/20 text-base"
                disabled={isGenerating}
              />
            </div>

            {/* Example Prompts */}
            <div className="space-y-2">
              <span className="text-xs text-slate-500">💡 Ideas rápidas (click para usar):</span>
              <div className="flex flex-wrap gap-2">
                {examplePrompts.map((example, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setPrompt(example.text);
                      setStyle(example.style);
                      setQuality(example.quality);
                    }}
                    className="text-xs px-3 py-1.5 rounded-full bg-slate-800/50 text-slate-400 hover:bg-purple-500/20 hover:text-purple-300 transition-colors border border-slate-700/50 hover:border-purple-500/50"
                    disabled={isGenerating}
                  >
                    {example.text.slice(0, 30)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Controls Grid - 2 rows on mobile */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Style Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-pink-400" />
                  Estilo
                </label>
                <Select value={style} onValueChange={setStyle} disabled={isGenerating}>
                  <SelectTrigger className="w-full bg-slate-800/50 border-slate-600/50 text-white">
                    <SelectValue placeholder="Estilo" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {ART_STYLES.map((s) => (
                      <SelectItem 
                        key={s.value} 
                        value={s.value}
                        className="text-white hover:bg-slate-700 focus:bg-slate-700"
                      >
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quality Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  Calidad
                </label>
                <Select value={quality} onValueChange={setQuality} disabled={isGenerating}>
                  <SelectTrigger className="w-full bg-slate-800/50 border-slate-600/50 text-white">
                    <SelectValue placeholder="Calidad" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {QUALITY_LEVELS.map((q) => (
                      <SelectItem 
                        key={q.value} 
                        value={q.value}
                        className="text-white hover:bg-slate-700 focus:bg-slate-700"
                      >
                        {q.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Size Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Tamaño</label>
                <Select value={size} onValueChange={setSize} disabled={isGenerating}>
                  <SelectTrigger className="w-full bg-slate-800/50 border-slate-600/50 text-white">
                    <SelectValue placeholder="Tamaño" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {IMAGE_SIZES.map((s) => (
                      <SelectItem 
                        key={s.value} 
                        value={s.value}
                        className="text-white hover:bg-slate-700 focus:bg-slate-700"
                      >
                        <div>
                          <span>{s.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Image Count */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Cantidad</label>
                <Select value={imageCount} onValueChange={setImageCount} disabled={isGenerating}>
                  <SelectTrigger className="w-full bg-slate-800/50 border-slate-600/50 text-white">
                    <SelectValue placeholder="Cantidad" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {IMAGE_COUNTS.map((c) => (
                      <SelectItem 
                        key={c.value} 
                        value={c.value}
                        className="text-white hover:bg-slate-700 focus:bg-slate-700"
                      >
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Generate Button */}
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <label className="text-sm font-medium text-transparent">Generar</label>
                <Button
                  onClick={generateImages}
                  disabled={!prompt.trim() || isGenerating}
                  className="w-full py-6 text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25 transition-all"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generar {imageCount !== '1' ? `${imageCount} ` : ''}Imagen{imageCount !== '1' ? 'es' : ''}
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Selected Style & Quality Preview */}
            {(style !== 'none' || quality !== 'standard') && (
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30">
                <p className="text-xs text-purple-300">
                  <span className="font-semibold">Mejoras aplicadas:</span>
                  {style !== 'none' && ` Estilo: ${ART_STYLES.find(s => s.value === style)?.label}`}
                  {quality !== 'standard' && ` • Calidad: ${QUALITY_LEVELS.find(q => q.value === quality)?.label}`}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-4 mb-8 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Result Area */}
        {(generatedImages.length > 0 || isGenerating) && (
          <div 
            ref={resultRef}
            className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 md:p-8 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-purple-400" />
                Imágenes Generadas {generatedImages.length > 0 && `(${generatedImages.length})`}
              </h2>
              {generatedImages.length > 1 && (
                <Button
                  onClick={downloadAllImages}
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar todas
                </Button>
              )}
            </div>
            
            {isGenerating && generatedImages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-purple-500/30 rounded-full animate-spin border-t-purple-500" />
                  <Sparkles className="w-8 h-8 text-purple-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-slate-400">Creando tu imagen mágica...</p>
                <p className="text-xs text-slate-500">{currentPrompt.substring(0, 60)}...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generatedImages.map((img, idx) => (
                  <div key={idx} className="relative group rounded-2xl overflow-hidden bg-slate-800/50 border border-slate-700/50">
                    <img
                      src={`data:image/png;base64,${img}`}
                      alt={`Imagen generada ${idx + 1}`}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            onClick={() => downloadImage(img, `ntm-${Date.now()}-${idx + 1}`)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-500"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Descargar
                          </Button>
                          <Button
                            onClick={() => setSelectedImage({
                              id: `current-${idx}`,
                              prompt: currentPrompt,
                              originalPrompt: prompt,
                              size,
                              style,
                              quality,
                              image: img,
                              createdAt: new Date().toISOString()
                            })}
                            size="sm"
                            variant="secondary"
                          >
                            <Expand className="w-4 h-4 mr-1" />
                            Ver
                          </Button>
                        </div>
                        {/* Social Share Buttons */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Button
                            onClick={() => shareOnTwitter(currentPrompt)}
                            size="sm"
                            variant="outline"
                            className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600"
                          >
                            <Twitter className="w-4 h-4 mr-1" /> Twitter
                          </Button>
                          <Button
                            onClick={shareOnFacebook}
                            size="sm"
                            variant="outline"
                            className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600"
                          >
                            <Facebook className="w-4 h-4 mr-1" /> Facebook
                          </Button>
                          <Button
                            onClick={shareOnInstagram}
                            size="sm"
                            variant="outline"
                            className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600"
                          >
                            <Instagram className="w-4 h-4 mr-1" /> Instagram
                          </Button>
                          <Button
                            onClick={() => shareOnWhatsApp(currentPrompt)}
                            size="sm"
                            variant="outline"
                            className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600"
                          >
                            <Share2 className="w-4 h-4 mr-1" /> WhatsApp
                          </Button>
                        </div>
                      </div>
                    </div>
                    {generatedImages.length > 1 && (
                      <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 text-xs">
                        #{idx + 1}
                      </div>
                    )}
                  </div>
                ))}
                {isGenerating && (
                  <div className="flex items-center justify-center aspect-square rounded-2xl bg-slate-800/30 border border-dashed border-slate-600">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">Generando...</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* History/Gallery */}
        {isMounted && history.length > 0 && (
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <History className="w-5 h-5 text-purple-400" />
                Historial
                <span className="text-sm font-normal text-slate-500">({history.length})</span>
              </h2>
              <Button
                onClick={clearHistory}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpiar
              </Button>
            </div>
            
            <ScrollArea className="w-full">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="group relative aspect-square rounded-xl overflow-hidden bg-slate-800/50 cursor-pointer border border-slate-700/50 hover:border-purple-500/50 transition-colors"
                    onClick={() => setSelectedImage(item)}
                  >
                    <img
                      src={`data:image/png;base64,${item.image}`}
                      alt={item.prompt}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <p className="text-xs text-white line-clamp-2">{item.originalPrompt}</p>
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFromHistory(item.id);
                        }}
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 bg-black/50 hover:bg-red-500/50 text-white"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    {item.style !== 'none' && (
                      <div className="absolute top-2 left-2 bg-purple-500/50 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs">
                        {ART_STYLES.find(s => s.value === item.style)?.label.split(' ')[0]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Image Preview Dialog */}
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] bg-slate-900 border-slate-700 overflow-hidden">
            <DialogTitle className="sr-only">Vista previa de imagen</DialogTitle>
            {selectedImage && (
              <div className="space-y-4">
                <img
                  src={`data:image/png;base64,${selectedImage.image}`}
                  alt={selectedImage.prompt}
                  className="w-full max-h-[55vh] object-contain rounded-lg"
                />
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-slate-800/50">
                    <p className="text-sm text-slate-300">{selectedImage.originalPrompt}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedImage.style !== 'none' && (
                        <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300">
                          {ART_STYLES.find(s => s.value === selectedImage.style)?.label}
                        </span>
                      )}
                      {selectedImage.quality !== 'standard' && (
                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-300">
                          {QUALITY_LEVELS.find(q => q.value === selectedImage.quality)?.label}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs text-slate-500">
                      {selectedImage.size} • {new Date(selectedImage.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => copyPromptToClipboard(selectedImage.originalPrompt, selectedImage.id)}
                        size="sm"
                        variant="ghost"
                        className="text-slate-400 hover:text-white"
                      >
                        {copiedId === selectedImage.id ? (
                          <><Check className="w-4 h-4 mr-1" /> Copiado</>
                        ) : (
                          <><Copy className="w-4 h-4 mr-1" /> Copiar prompt</>
                        )}
                      </Button>
                      <Button
                        onClick={() => downloadImage(selectedImage.image, `ntm-${selectedImage.id}`)}
                        size="sm"
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Descargar
                      </Button>
                    </div>
                  </div>
                  {/* Share buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-700">
                    <span className="text-xs text-slate-500">Compartir:</span>
                    <Button
                      onClick={() => shareOnTwitter(selectedImage.prompt)}
                      size="sm"
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-800"
                    >
                      <Twitter className="w-4 h-4 mr-1" /> Twitter
                    </Button>
                    <Button
                      onClick={shareOnFacebook}
                      size="sm"
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-800"
                    >
                      <Facebook className="w-4 h-4 mr-1" /> Facebook
                    </Button>
                    <Button
                      onClick={shareOnInstagram}
                      size="sm"
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-800"
                    >
                      <Instagram className="w-4 h-4 mr-1" /> Instagram
                    </Button>
                    <Button
                      onClick={() => shareOnWhatsApp(selectedImage.prompt)}
                      size="sm"
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-800"
                    >
                      <Share2 className="w-4 h-4 mr-1" /> WhatsApp
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-slate-500">
          <p>{APP_NAME} - Genera imágenes increíbles con inteligencia artificial</p>
          <p className="mt-1 text-xs">Sin límites • Sin registro • 100% gratis</p>
        </footer>
      </div>
    </div>
  );
}
