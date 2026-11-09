# Anézky Sports Wear — tienda e inventario

Sitio estático en español para mostrar productos y administrar el inventario, las ventas y los gastos.

## Funciones

- Catálogo con búsqueda y filtro por categoría.
- Añadir, editar y eliminar productos.
- Registrar ventas desde el catálogo o desde el panel de ventas.
- Registrar gastos, mostrados en rojo junto al total de ventas.
- Sección independiente de ganancias con ventas menos gastos.

Los datos se guardan en `localStorage` del navegador. Eso significa que los cambios son locales a ese navegador y no se sincronizan con otros dispositivos sin una base de datos.

## GitHub Pages

El workflow `.github/workflows/pages.yml` publica la rama `main` automáticamente al hacer push.

En GitHub, abre **Settings → Pages** y selecciona **GitHub Actions** como fuente si hace falta.

URL esperada:
https://wilvertc1.github.io/Anezky-sportswear-inventario/

Esta es una versión editable inspirada en una tienda deportiva y no copia exacta del sitio de Netlify, dado que ese sitio no expone su código fuente original.
