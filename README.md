# Generador de Imágenes NTM

Una aplicación web de generación de imágenes con IA, **100% gratuita**, sin registro y sin límites.

## ✨ Características

- 🎨 **12 estilos artísticos**: Realista, Anime, Arte Digital, Pintura al Óleo, Acuarela, 3D Render, Cyberpunk, Fantasía, Minimalista, Pixel Art, Boceto
- 📺 **5 niveles de calidad**: Estándar, HD, 2K, 4K Ultra HD, 8K Master
- 📐 **7 tamaños de imagen**: Cuadrado, Vertical, Retrato, Paisaje, Apaisado, Panorámico, Móvil
- 🔢 **Múltiples imágenes**: Genera de 1 a 4 imágenes a la vez
- 📱 **Compartir en redes**: Twitter, Facebook, Instagram, WhatsApp
- 💾 **Historial local**: Guarda tus últimas 30 imágenes generadas
- 📥 **Descarga directa**: Descarga tus imágenes en formato PNG

## 🚀 Tecnología

- **Frontend**: Next.js 15, React 19, Tailwind CSS, shadcn/ui
- **Backend**: API Routes de Next.js
- **Generación de imágenes**: [Pollinations.ai](https://pollinations.ai) - API gratuita y de código abierto

## 💰 Costo

**¡Es 100% GRATIS!**

- Sin API keys
- Sin registro
- Sin límites de uso
- Sin tarjeta de crédito

Pollinations.ai es un servicio de código abierto que permite generar imágenes de forma gratuita.

## 🌐 Despliegue en Vercel

### Opción 1: Desde GitHub

1. Sube este proyecto a un repositorio de GitHub
2. Ve a [vercel.com](https://vercel.com)
3. Haz clic en "New Project"
4. Importa tu repositorio
5. Haz clic en "Deploy"

### Opción 2: Desde CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel
```

## 🛠️ Desarrollo Local

```bash
# Instalar dependencias
bun install

# Iniciar servidor de desarrollo
bun run dev

# Abrir http://localhost:3000
```

## 📝 Notas

- La generación de imágenes puede tardar entre 5-30 segundos dependiendo de la complejidad
- Pollinations.ai usa modelos de Stable Diffusion
- El historial se guarda localmente en el navegador (localStorage)

## 📄 Licencia

MIT - Uso libre para cualquier propósito.
