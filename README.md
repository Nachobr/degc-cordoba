# Departamento de Eficiencia Gubernamental de Córdoba (DEGC)

## Descripción
El DEGC es una plataforma de transparencia gubernamental que permite a los ciudadanos de Córdoba monitorear y analizar los gastos públicos en tiempo real, con un enfoque inicial en los sueldos de funcionarios públicos y ejecuciones presupuestarias (obras etc) de cada jurisidicción.

## Características Principales
- 📊 Visualización de gastos en sueldos públicos
- 🔍 Búsqueda por jurisdicción y período
- 📅 Datos actualizados mensualmente (en progreso)
- 📱 Diseño responsive
- 🚨 Sistema de denuncias ciudadanas (incompleto)

## Objetivos
- Aumentar la transparencia en el gasto público
- Facilitar el acceso a la información gubernamental
- Promover la participación ciudadana
- Identificar áreas de mejora en la eficiencia del gasto

## Tecnologías Utilizadas
- Next.js 14
- TypeScript
- Tailwind CSS
- API REST

## ¿Cómo funciona? (How it works)

### Estructura del Proyecto

- **Framework:** El proyecto utiliza [Next.js 14](https://nextjs.org/) con TypeScript para el frontend y la lógica de servidor.
- **Estilos:** Se emplea Tailwind CSS para el diseño responsivo y estilos rápidos.
- **Datos:** Los datos de sueldos y ejecuciones presupuestarias se almacenan en archivos JSON dentro de la carpeta `data/`.
- **Componentes:** Los componentes principales de la UI están en `app/components/`.
- **Páginas:** Las rutas principales están en la carpeta `app/`, siguiendo la convención de rutas de Next.js (por ejemplo, `/gastos`, `/denuncias`).

### Flujo de Datos

1. **Carga de Datos:**  
   Los datos de sueldos (`sueldos.json`), ejecuciones (`executions.json`) y detalles de ejecución (`executionDetails.json`) se importan directamente en los componentes de página usando imports estáticos.
2. **Visualización:**  
   - `/gastos`: Muestra el resumen de gastos por jurisdicción, con filtros por año y mes.
   - `/gastos/[jurisdiccion]`: Detalla los gastos de una jurisdicción específica, permitiendo búsqueda y ordenamiento.
   - `/denuncias`: Permite a los usuarios reportar irregularidades o sugerencias(sin implementar).
3. **Interactividad:**  
   - Se usan hooks de React (`useState`, `useEffect`) para manejar el estado, la carga de datos y la interacción del usuario.
   - El filtrado, búsqueda y ordenamiento se realizan en el frontend, sobre los datos cargados.
4. **Estilos y Temas:**  
   - El tema claro/oscuro se gestiona con un `ThemeProvider`.
   - El diseño es mobile-first y responsivo.

### Colaboración y Desarrollo

- **Instalación:**  
  1. Clona el repositorio  
  2. Instala dependencias con `npm install` o `yarn`
  3. Ejecuta el entorno de desarrollo con `npm run dev` o `yarn dev`
- **Agregar Datos:**  
  - Para actualizar los datos, modifica los archivos en `data/`.
  - Si agregas nuevas fuentes de datos, importa los archivos en los componentes correspondientes.
- **Agregar Funcionalidades:**  
  - Crea nuevos componentes en `app/components/`.
  - Agrega nuevas páginas en `app/` siguiendo la convención de rutas de Next.js.
- **Estilo de Código:**  
  - Usa TypeScript para tipado.
  - Sigue la convención de componentes funcionales y hooks.
  - Utiliza clases de Tailwind para estilos rápidos.

### Scripts Útiles

- `npm run dev` — Inicia el servidor de desarrollo
- `npm run build` — Genera la build de producción
- `npm run lint` — Linting del código
- `npm run worker` — Ejecuta el worker para actualizar datos (si aplica)
- `npm run twitter-bot` — Ejecuta el bot de Twitter (si aplica)

### Notas

- El sistema de denuncias está en desarrollo.
- Los datos pueden actualizarse manualmente o mediante scripts.
- Si tienes dudas, revisa los comentarios en los archivos de componentes o abre un issue.

¡Colabora enviando PRs o sugiriendo mejoras!


