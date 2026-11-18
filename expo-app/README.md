# QINXVI — Liquid Glass Workout Manager (React Native + Expo)

Offline-first iOS & Android workout manager built with React Native, Expo, TypeScript, `expo-blur`, `expo-linear-gradient`, `react-native-reanimated`, `expo-sqlite` / `AsyncStorage`, `expo-sensors` (Pedometer), and `expo-notifications`.

## Setup & Run

```bash
cd expo-app
npm install
npx expo start
```

- Press **`i`** for iOS Simulator (macOS) or scan the QR code with Expo Go on iOS/Android.
- Press **`a`** for Android Emulator.
- Default Launch Access Code: **`QINXVI`** (case-insensitive).

## Architecture

- `src/theme/tokens.ts` — Liquid Glass optical tokens, 7 Training Type color tints, Priority R/B/G neon outlines, Rank tier tokens
- `src/components/glass/` — `LiquidGlass`, `GlassButton`, `GlassIconButton`, `GlassInput`, `GlassSelect`, `GlassSwitch`, `GlassTabsCard`, `GlassPlanCard`, `GlassProgressRing`
- `src/data/program.ts` — Pre-loaded Mon–Sun plan, 10-move Daily Warm-up, 10-move Height & Posture Routine, Stamina Finisher
- `src/storage/database.ts` — SQLite + AsyncStorage offline persistence (plan edits, set weights, step history, rank history, settings)
- `src/services/notifications.ts` — All 8 local notification categories (`expo-notifications`)
- `src/services/pedometer.ts` — `expo-sensors` Pedometer with graceful permissions & 10k target
- `src/screens/` — Component Showcase, Lock Screen, Home/Today, Week View, Day Detail, Exercise & Timers, Sequences, Progress Charts, Plan Editor, Settings, Rank Reveal
