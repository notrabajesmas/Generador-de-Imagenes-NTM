# 🎨 Generador de Imágenes NTM

Una aplicación web moderna para generar imágenes con inteligencia artificial de forma ilimitada y gratuita.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css)

## ✨ Características

- 🖼️ **Generación Ilimitada** - Sin límites, sin registro requerido
- 🎨 **12 Estilos Artísticos** - Anime, realista, óleo, acuarela, 3D, cyberpunk y más
- ⚡ **5 Niveles de Calidad** - Desde HD hasta 8K Master
- 📐 **7 Tamaños de Imagen** - Cuadrado, vertical, panorámico, etc.
- 🔢 **Múltiples Imágenes** - Genera hasta 4 imágenes a la vez
- 📱 **Compartir en Redes** - Twitter, Facebook, Instagram, WhatsApp
- 💾 **Historial Local** - Guarda hasta 30 imágenes en el navegador
- ⬇️ **Descarga Fácil** - Descarga individual o todas juntas

## 🚀 Despliegue en Vercel

### Opción 1: Desde GitHub (Recomendado)

1. **Sube a GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Generador de Imágenes NTM"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/generador-imagenes-ntm.git
   git push -u origin main
   ```

2. **Conecta con Vercel:**
   - Ve a [vercel.com](https://vercel.com)
   - Click en "Add New Project"
   - Importa tu repositorio de GitHub
   - Click en "Deploy"
   - ¡Listo! 🎉

### Opción 2: Vercel CLI (Sin GitHub)

```bash
# Instala Vercel CLI
npm i -g vercel

# Despliega directamente
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

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── api/
│   │   ├── generate-image/route.ts  # API de generación
│   │   └── health/route.ts          # Health check
│   ├── page.tsx                      # Página principal
│   ├── layout.tsx                    # Layout
│   └── globals.css                   # Estilos globales
├── components/ui/                    # Componentes shadcn/ui
└── lib/                              # Utilidades
```

## 🎯 Estilos Disponibles

| Estilo | Descripción |
|--------|-------------|
| 📸 Realista | Fotografía profesional ultra detallada |
| 🎌 Anime/Manga | Estilo japonés con colores vibrantes |
| 🎨 Arte Digital | Concept art estilo ArtStation |
| 🖼️ Pintura al Óleo | Arte clásico con texturas ricas |
| 💧 Acuarela | Colores suaves y estilo soñador |
| 🎮 3D Render | Octane render, Unreal Engine 5 |
| 🌃 Cyberpunk | Neones, futurista, atmósfera oscura |
| 🧙 Fantasía | Mágico, etéreo, épico |
| ⚪ Minimalista | Diseño limpio y simple |
| 👾 Pixel Art | 16-bit, estética retro |
| ✏️ Boceto/Lápiz | Dibujo a mano artístico |

## ⚡ Niveles de Calidad

| Calidad | Modificadores |
|---------|---------------|
| 📺 Estándar | Sin modificadores |
| 🖥️ HD | High definition, sharp details |
| 🎥 2K | 2K resolution, crisp details |
| 🎬 4K Ultra HD | Ultra high definition, extremely detailed |
| 🌟 8K Master | Masterpiece, hyperrealistic, ultra sharp |

## 🔧 Tecnologías

- **Next.js 16** - Framework React
- **TypeScript** - Tipado estático
- **Tailwind CSS 4** - Estilos utility-first
- **shadcn/ui** - Componentes UI
- **Lucide React** - Iconos
- **z-ai-web-dev-sdk** - Generación de imágenes con IA

## 📄 Licencia

MIT - Libre para uso personal y comercial.

---

Hecho con ❤️ para la comunidad
