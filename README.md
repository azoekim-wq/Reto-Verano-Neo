# Reto Verano · Neo

Rediseño del reto fitness interno del equipo de I+D. Estética top-trend (tema oscuro, acento lima ácido, bento grid, tipografía Space Grotesk) construida sobre la misma base de datos Firebase que la versión actual — **la app original sigue activa** en paralelo, ninguna migración destructiva.

![estado](https://img.shields.io/badge/status-preview-acid?color=%23C6FF3D)
![stack](https://img.shields.io/badge/stack-Vite_React_TS_Firebase-black)

## Stack

- **Vite 5** + **React 18** + **TypeScript**
- **Tailwind CSS 3** con tokens custom (paleta fitness, Space Grotesk / Inter / JetBrains Mono)
- **Framer Motion** para microanimaciones
- **Recharts** para gráficas
- **Lucide React** para iconografía
- **Zod** para validación de datos de Firestore
- **Firebase 11** (Auth + Firestore + Analytics)
- **PWA** instalable (`vite-plugin-pwa`)
- **ESLint + Prettier** + **GitHub Actions** (typecheck + lint + build en cada PR)

## Requisitos

- Node.js ≥ 18.
- Cuenta en Vercel (Hobby / gratis) para deploy.
- Firebase: el proyecto actual (`reto-verano-46f08`) se reutiliza tal cual. No hace falta crear otro.

## Primeros pasos

```bash
npm install
cp .env.example .env.local   # rellena con las credenciales Firebase
npm run dev                  # http://localhost:5173
```

El fichero `.env.local` ya está preparado con la config del proyecto compartido. Si lo clonas en otra máquina, copia `.env.example` y rellena.

### Modo mock (sin Firebase)

Para trabajar el diseño sin tocar Firebase (y sin contar contra cuotas), ajusta `.env.local`:

```
VITE_DATA_MODE=mock
```

La app arranca con datos ficticios del equipo. Útil para demos y diseño.

## Scripts

| Comando             | Descripción                                            |
| ------------------- | ------------------------------------------------------ |
| `npm run dev`       | Dev server con HMR                                     |
| `npm run build`     | Typecheck + build de producción en `dist/`             |
| `npm run preview`   | Sirve el build localmente                              |
| `npm run lint`      | ESLint                                                 |
| `npm run typecheck` | Solo chequeo de tipos                                  |
| `npm run format`    | Prettier sobre `src/`                                  |

## Estructura

```
src/
├── app/              # App + shell + layout
├── components/       # UI (Button, Card, Chip, Avatar) + visuales (Heatmap, Ring, Spark)
├── features/         # una carpeta por vista (dashboard, leaderboard, achievements, weights, auth)
├── services/         # Firebase init y capa de acceso a datos (listWeights, addWeight, …)
├── hooks/            # (reservado) useAuth, useWeights, useLeaderboard
├── lib/              # utilidades, formateo, streaks
├── types/            # tipos de dominio
├── mocks/            # fixtures para VITE_DATA_MODE=mock
└── styles/           # CSS global + tokens
```

## Firebase — reglas mínimas recomendadas

El proyecto comparte base de datos con la app actual. Cuando toque endurecer la seguridad, éstas son las reglas mínimas:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == uid;
    }
    match /weights/{id} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

## Deploy en Vercel (paralelo a la app actual)

1. Crea un nuevo repo en GitHub con este proyecto (`reto-verano-neo`).
2. En Vercel → "New Project" → importa ese repo.
3. Framework preset: Vite. Build command: `npm run build`. Output: `dist`.
4. En **Environment Variables**, pega todas las `VITE_FIREBASE_*` del `.env.local`. **No subas** `.env.local` a git (está en `.gitignore`).
5. Deploy. Vercel te dará una URL tipo `reto-verano-neo.vercel.app`.
6. En **Firebase Console → Authentication → Settings → Authorized domains**, añade el nuevo dominio (`reto-verano-neo.vercel.app`). Si no lo haces, el login SSO fallará.

La app original sigue intacta. Cuando quieras, puedes apuntar dominio personalizado a esta nueva y retirar la antigua sin prisa.

## Roadmap

Ver `/plan-migracion.md` (en la carpeta de outputs de Cowork) para el plan por fases completo.

## Licencia

Proyecto interno.
