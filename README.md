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
- **Generación de imágenes**: [Pollinations.ai](https://pollinations.ai) con modelo Flux

## 💰 Costo

**¡Es 100% GRATIS!**

- Sin registro requerido para usuarios
- Sin límites de uso (con API key)
- Sin tarjeta de crédito

## 🔑 Configuración de API Key

### ¿Por qué necesito una API key?

Sin API key, Pollinations limita a 1 solicitud por IP. Para una app pública, necesitas una API key para acceso ilimitado.

### Cómo obtener una API key gratuita:

1. Ve a [pollinations.ai](https://pollinations.ai)
2. Regístrate gratuitamente
3. Obtén tu API key

### Configuración local:

1. Crea un archivo `.env.local` en la raíz del proyecto:
```
POLLINATIONS_API_KEY=tu_api_key_aqui
```

## 🌐 Despliegue en Vercel

### Paso 1: Subir a GitHub

```bash
git init
git add .
git commit -m "Generador de Imágenes NTM"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/generador-imagenes-ntm.git
git push -u origin main
```

### Paso 2: Configurar en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en "New Project"
3. Importa tu repositorio
4. **Importante**: Agrega la variable de entorno:
   - Nombre: `POLLINATIONS_API_KEY`
   - Valor: `tu_api_key_de_pollinations`
5. Haz clic en "Deploy"

### Configurar variable de entorno en Vercel:

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega:
   - Key: `POLLINATIONS_API_KEY`
   - Value: `sk_tu_api_key`
4. Redeploy para aplicar cambios

## 🛠️ Desarrollo Local

```bash
# Instalar dependencias
bun install

# Configurar API key
cp .env.example .env.local
# Edita .env.local con tu API key

# Iniciar servidor de desarrollo
bun run dev

# Abrir http://localhost:3000
```

## 📝 Notas

- La generación de imágenes puede tardar entre 5-30 segundos
- Se usa el modelo Flux de alta calidad
- El historial se guarda localmente en el navegador (localStorage)

## 📄 Licencia

MIT - Uso libre para cualquier propósito.
