# 🚀 Guía de Despliegue en Netlify

## Problema Solucionado
El error 404 al refrescar páginas en Netlify ocurría porque Netlify no sabía cómo manejar las rutas de React Router.

## ✅ Archivos Configurados

### 1. `netlify.toml`
- Configura el directorio de publicación como `build`
- Redirige todas las rutas a `index.html` (status 200)
- Esto permite que React Router maneje el enrutamiento del lado del cliente

### 2. `public/_redirects`
- Archivo de respaldo con la misma configuración de redirección
- Netlify revisa este archivo automáticamente

## 📋 Pasos para Desplegar

### Opción 1: Desde tu repositorio local
```bash
# 1. Hacer commit de los cambios
git add .
git commit -m "Fix: Configurar Netlify para SPA routing"
git push origin main

# 2. Netlify detectará los cambios automáticamente y re-desplegará
```

### Opción 2: Deploy manual (si no tienes auto-deploy)
```bash
# 1. Construir el proyecto
npm run build

# 2. El contenido de la carpeta 'build' debe subirse a Netlify
# Netlify CLI (si lo tienes instalado):
netlify deploy --prod
```

## 🔧 Verificación Post-Despliegue

Después del despliegue, verifica:

1. ✅ La página principal carga correctamente
2. ✅ Puedes navegar a `/almacenes`, `/productos`, etc.
3. ✅ Al refrescar en cualquier ruta, la página NO da 404
4. ✅ La sesión se mantiene después de refrescar

## 🎯 ¿Qué hace la configuración?

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Esta regla le dice a Netlify:
- **from = "/*"**: Para cualquier ruta solicitada
- **to = "/index.html"**: Sirve el archivo index.html
- **status = 200**: Con código de éxito (no redirección 301/302)

Esto permite que React Router tome el control y renderice el componente correcto según la URL.

## 📝 Nota Importante

Después de hacer push de estos cambios, espera 1-2 minutos para que Netlify:
1. Detecte los cambios
2. Ejecute `npm run build`
3. Despliegue la nueva versión

¡Entonces el problema estará completamente resuelto! 🎉
