# CLAUDE.md

## What this is

**TongueUp** (French store name: *Pense Langue*) — an Expo / React Native app that reminds users to keep their tongue on the roof of their mouth (correct tongue posture / "mewing"). Users log whether their tongue was in the right place, see a chart of their history, and get periodic reminder notifications.

- Published **only on Google Play** (`com.jybenlarcher.tongueup`). iOS config exists but the app is not shipped there; don't spend effort on iOS-only behavior unless asked.
- Fully offline: no backend, no accounts. All state lives in AsyncStorage on the device.
- Supported languages: English and French.
- Support/privacy site: https://tongueup.benjylarcher.com/

## Stack

- Expo SDK 58, React Native 0.88, React 19.3 (`experiments.reactCanary: true`), Hermes, TypeScript 6 (strict).
- Native/Expo-managed packages are pinned by the SDK: upgrade them with `npx expo install expo@^<sdk>` then `npx expo install --fix`, and check with `npx expo install --check` + `npx expo-doctor`. Don't bump e.g. async-storage, gesture-handler or TypeScript past the SDK's pinned versions with plain `npm install`.
- Gesture handler is v3: `BorderlessButton`/`RectButton` are deprecated — use `Touchable` (see `components/Button.tsx`).
- Navigation: `@react-navigation/bottom-tabs` (3 tabs, no stack navigator in use).
- Notifications: `expo-notifications` + `expo-background-task` / `expo-task-manager`.
- i18n: `i18next` + `react-i18next` + `expo-localization`.
- Charts: `react-native-gifted-charts` (SVG-based; no Skia). Icons: `@react-native-vector-icons/lucide` (font registered via the `expo-font` plugin in `app.json`).
- npm (`package-lock.json`). No test runner, linter, or formatter configured.

## Commands

```bash
npm install
npm start                  # expo start (needs a dev client; Expo Go won't run background tasks properly)
npm run web                # expo start --web: browser preview of the UI (react-native-web)
npm run android            # expo run:android — local native build, regenerates android/ via prebuild
npm run export:web-demo    # web build for the live demo on the marketing site (see below)
npx tsc --noEmit           # the only static check available
eas build -p android --profile production
eas submit -p android --profile production
```

### Previewing UI changes
- **Web (fastest, no device):** `.claude/launch.json` defines an `expo` config (`npx expo start --port 8081`); with `react-native-web` installed the same Metro server serves the web build at http://localhost:8081, so Claude can open it with the browser preview tool and set a mobile viewport (375×812). The phone can use that same server.
- Web is for layout/colour/typography checks only, not a target platform. Known differences: system font differs from Android's Roboto (text runs slightly wider), no notifications or background tasks (the push-permission flow is skipped on web), URL paths like `/Reminder` don't route (no linking config, switch tabs by clicking), and `Animated` falls back to JS.
- **Device:** `npm run android` (or `npx expo run:android --device <serial>`) builds and installs a debug build; `adb exec-out screencap -p > shot.png` grabs a screenshot. Don't run it with `CI=1`: Metro then disables file watching and edits won't reload.
- Web-specific code paths in components: `App.tsx` preloads the Lucide font before first render on web and gives the tab bar a taller height there (no bottom inset, so the default squeezes the labels); `RollPicker` settles its selection on a scroll-pause timer on web because react-native-web never fires `onMomentumScrollEnd`; `Button` puts its disabled opacity on a wrapper because gesture-handler's `Touchable` sets inline opacity on web.

`npx tsc --noEmit` should pass with no errors. `npx expo export --platform android` is a quick way to check the JS bundle resolves without a native build.

### Marketing site live demo
The site (https://tongueup.benjylarcher.com/) lives in the separate `benjylarcher` repo (`tongueup/` Vite app, assets in `public/tongueup/`) and embeds the real app in a phone frame. `npm run export:web-demo` (`scripts/export-web-demo.js`) exports the web build with base URL `/demo` (via `WEB_BASE_URL` in `app.config.js`) into `../benjylarcher/public/tongueup/demo`; pass another output dir after `--` if that repo lives elsewhere. Re-run it and commit the output there whenever the app UI changes. The site seeds the demo's AsyncStorage (= localStorage, same origin) with sample history and its own language/theme in `tongueup/demo.ts`, so keep that in step if storage keys or the data format change. To preview the site, `.claude/launch.json` has a `site` config (Vite on http://localhost:5181, run from the sibling repo).

## Build & release notes

- Local Android builds on Windows need CMake ≥ 3.31 (its ninja supports long paths; CMake 3.22.1's doesn't, and gesture-handler 3's C++ paths exceed 260 chars). Install `cmake;3.31.6` in the SDK and set `cmake.dir` in `android/local.properties` — that file is wiped by `prebuild --clean`, so re-add it. EAS (Linux) builds are unaffected.
- Release builds use R8 (`enableProguardInReleaseBuilds`). Keep the `extraProguardRules` Room rule in `app.json` as long as `expo-background-task` is installed: without it WorkManager crashes on launch. Test release builds (`gradlew assembleRelease`), not just debug.
- `android/` is **gitignored** and generated by prebuild (CNG). Make native changes through `app.json` / config plugins, not by editing `android/` directly.
- `eas.json` uses `appVersionSource: "remote"` + `autoIncrement` for production, so EAS owns the Android `versionCode`; the `versionCode` in `app.json` is not authoritative.
- `google-services.json` is gitignored and referenced both as `android.googleServicesFile` and as the Play submit `serviceAccountKeyPath`. Never commit it. `local.properties` holds a machine-specific Android SDK path.
- `SCHEDULE_EXACT_ALARM` is declared via `android.permissions` in `app.json`. Don't switch to `USE_EXACT_ALARM`: Google Play reserves it for alarm-clock / calendar apps.
- `store.config.json` / `store.config.ts` hold store listing metadata (`eas metadata`). `locales/*.json` are the native app-name/description localizations referenced from `app.json` (note: `locales/en.json`'s description is a stale placeholder describing a "language learning app").
- `.easignore` excludes `android/` and `ios/` so EAS does its own prebuild.
- `icon.xcf` is the GIMP source for the icon; exported images live in `assets/`.

## Architecture

Entry: `src/index.ts` → `src/App.tsx`.

`App.tsx` calls `setupTaskManager()` at module load (task definitions must be global), calls `useNotificationSetup()` (Android `reminders` channel + unregistering the legacy background task), then wraps everything in:

```
GestureHandlerRootView > SafeAreaProvider > SettingsProvider > ThemeProvider > SavedDataProvider > Navigation
```

Order matters: `ThemeProvider` reads from `useSettings()`. `Navigation` calls `useReminderSync()`, which needs `SettingsProvider`.

### Tabs (`src/screens/`)
| Tab name (route) | Screen | Content |
|---|---|---|
| `Notes` | `HomeScreen.tsx` | `MomentaryNotesCard`, `PeriodicThoughtsCard`, `ProgressCard` |
| `Reminder` | `ReminderScreen.tsx` | `NotificationCard` (from `components/cards/ReminderCard.tsx`) |
| `Settings` | `SettingsScreen.tsx` | dark theme toggle, clear data, language selector |

Route names are typed in `src/types/navigation.ts` (`RootTabParamList`). `RootStackParamList` there is unused template code.

### State (`src/context/`)
- **`SettingsContext.tsx`** — `Settings` (`src/types/settings.ts`): `frequency`, `notificationsEnabled`, `quietTime {start,end}` (hours 0–23), `quietTimeEnabled`, `strictTiming`, `reminderAnchorMinute`, `theme`; `defaultSettings` is exported and merged into stored settings. Use `updateSettings({...})` to change several keys at once — consecutive `updateSetting` calls in one handler overwrite each other. Persisted under `@app_tongue_patrol_settings`. Contains a small migration (`oldFrequencyToNew`) for old frequency indices.
- **`ThemeContext.tsx`** — exposes `theme`, `isDark`, `colors` (palettes live in `src/theme/tokens.ts`) and `toggleTheme`. The theme is derived from `settings.theme`, so toggling just calls `updateSetting('theme', …)`.
- **`TimeSeriesData.tsx`** (`SavedDataProvider`, `useSavedTimeseries`) — sparse, sorted array of `{ t, ok, nok }` persisted under `@app_tongue_timeseries_data`, one entry per hour that has check-ins. `t` is **hours since epoch** (`Math.floor(Date.now()/3_600_000)`). Empty hours aren't stored (older versions stored a zero point for every hour; `loadData` compacts them away). The whole history is one AsyncStorage value, so it's capped at `MAX_STORED_POINTS` (~1.5 MB of JSON) to stay under Android's ~2 MB per-value cursor limit. `addPoint(ok, nok)` increments the current hour's bucket.

### Logging entries
- `MomentaryNotesCard`: one-tap "tongue on roof" (ok) / "pushing teeth / don't know" (nok).
- `PeriodicThoughtsCard`: retroactive counts (1–10) of ok/nok for times the user didn't have their phone.
- Both show a "keep up the good work" state for `TIME_NO_RECORD` (30 s) after submitting, tracked via `useAsyncStorage` keys `lastEntryRecord` / `lastPeriodicEntryRecord`.
- `ProgressCard`: Day / Week / Month / Year range picker with ‹ › paging to earlier windows, totals, and a two-line chart (green = ok, red = nok). `utils/chartWindow.ts` sums the sparse points into a fixed number of buckets per range (24 hours, 7 or 30 days, 12 months) so the chart always fits the card: react-native-svg rasterises the whole chart on Android, so never make it a long scrolling chart.

### Reminders / notifications
- Reminders are **pre-scheduled OS alarms**, not a background job: `src/utils/reminderSchedule.ts` schedules one expo-notifications `DAILY` trigger per time slot (ids `tongueup-reminder-HHMM`, channel `reminders`). expo-notifications sets them with `setExactAndAllowWhileIdle` when the exact-alarm permission is granted (inexact otherwise), or `setAlarmClock` when `strictTiming` is on (`delivery: 'alarmClock'`), and re-arms them after reboot / app update.
- `computeReminderSlots(settings)`: with quiet hours on, slots start at `quietTime.end` and repeat every interval until `quietTime.start`; with them off (or start == end), they start from `reminderAnchorMinute` (set when reminders are enabled) and cover 24 h. Every frequency divides 24 h, so the slots repeat daily without topping up (max 96 alarms).
- `syncReminderSchedule(settings?)` is the only code that schedules or cancels reminders. It's idempotent: it compares a signature (slots, delivery, exact-alarm permission, language) stored under `@app_tongue_reminder_schedule_sig` plus the scheduled ids, and only reschedules when something changed. Calls are serialized. `useReminderSync()` (`src/hooks/useReminders.ts`) runs it whenever settings or the language change (skipping while settings load, since defaults would cancel everything), and on every return to the foreground — which also picks up a newly granted exact-alarm permission and dismisses delivered reminders.
- `NotificationCard` only changes settings: it requests the notification permission, then sets `notificationsEnabled` + `reminderAnchorMinute`. It shows the next reminder time, rows for a blocked notification permission / missing exact-alarm permission (`requestExactAlarmPermissionsAsync`, denied by default on Android 14+), the strict-timing toggle, and a shortcut to battery-optimization settings.
- `src/background_task.ts` is legacy: older versions sent reminders from a WorkManager task. It's still defined (its body just calls `syncReminderSchedule()`) and `retireLegacyBackgroundTask()` unregisters it on launch. Remove it and `expo-background-task` / `expo-task-manager` (plus the Room ProGuard rule) in a later release.
- Things no local approach can fix: force-stopping the app clears its alarms until it's opened again, and some OEM battery managers defer even exact alarms (that's what strict timing is for). There is no remote push.

### Frequencies
`src/components/FrequencySelector.tsx` exports `frequencies` (label → seconds), `FrequencyToi18n` (label → i18n key) and `frequencyHoursLimits`. **`settings.frequency` is stored as an index into `Object.keys(frequencies)`**, so reordering, inserting or removing entries silently changes users' saved choice — extend `migrateFrequency` in `SettingsContext` if you must change the list (the reminder scheduler applies it too).

### Shared constants
`SETTINGS_STORAGE_KEY`, `defaultSettings` and `migrateFrequency` are exported from `SettingsContext.tsx`; `REMINDER_CHANNEL_ID` from `utils/reminderSchedule.ts`; `BACKGROUND_FETCH_TASK` from `background_task.ts`. Import them rather than redefining the strings — the scheduler reads storage directly, outside React.

### Localization
- Translations are TS objects in `src/localization/en.ts` and `fr.ts`. `en.ts` is the typed source of truth (`src/i18next.d.ts` types `t()` keys from it), so add every new key to **both** files with the same shape.
- `src/localization.ts` initializes i18next in the device language, then applies the language saved under `settings.lang` (`languageRestored` resolves once done). Change language with `setAppLanguage()`, which also saves it; a plain `i18n.changeLanguage` isn't persisted.

### Styling conventions
- Design tokens live in `src/theme/tokens.ts`: `lightColors` / `darkColors` (plum primary + warm cream, from the app icon; `success` = tongue on the roof, `error` = soft coral for "not quite"), `spacing`, `radius`, `typography` (type scale: `display`, `title`, `headline`, `body`, `callout`, `caption`, `overline`, `stat`), `elevation(colors)` and `toneColors(colors, tone)` for `primary | success | error | neutral` fg/soft-bg pairs. Use tokens instead of literal colors, sizes or font sizes.
- No styling library. Components build styles with a local `createStyles(colors)` → `StyleSheet.create(...)`, memoized via `useMemo(() => createStyles(colors), [colors])`; color-independent styles are a plain module-level `StyleSheet`.
- Text goes through `AppText` (`variant` from the type scale, `tone` for color) rather than raw `<Text>`.
- Screens wrap content in `ScreenWrapper` (`title`, optional `eyebrow` / `subtitle`): background, soft brand gradient, safe-area top padding, the header and a `ScrollView` with consistent gutters/gaps. Content is a stack of cards.
- Building blocks in `src/components/`: `Card` (`title`, `subtitle`, `icon`, `headerRight`), `ListRow` + `Divider` (settings-style row with an accessory), `Button` (`primary | secondary | danger | ghost`, `md | sm`, optional `icon`, `fullWidth`), `IconBadge`, `ChoiceTile` (big answer tile), `Stepper`, `Toggle`, `SegmentedControl` (used by `LanguageSelector`), `StatTile`, `CelebrationState`, `LoadingSpinner`, and the `RollPicker` wheel used by `FrequencySelector` / `TimeSelector`. Pressables use gesture-handler's `Touchable`.

### Unused / template leftovers
`src/utils/index.ts` (formatters, mock `storage`), `src/hooks/index.ts` (`useForm`, `useKeyboard`, …), the `Card`/`User`/`AppState` types in `src/types/common.ts`, and `src/utils/getDeviceId.ts` (imports `expo-application`, which is only a transitive dependency, not in `package.json`) and `components/EmptyState.tsx` are not used by the app. `react-native-element-dropdown` is still in `package.json` but no longer imported.
