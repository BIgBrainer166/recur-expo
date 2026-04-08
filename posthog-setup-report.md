<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into Billza, an Expo React Native subscription management app. Here is a summary of all changes made:

**New files created:**
- `app.config.js` — Expo dynamic config exporting the existing `app.json` settings plus PostHog extras (`posthogProjectToken`, `posthogHost`) sourced from environment variables.
- `libs/posthog.ts` — PostHog client singleton configured via `expo-constants`, with lifecycle event capture, batching, debug mode, and graceful no-op when the token is not set.
- `.env` — Updated with `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST` (existing Clerk key preserved).

**Modified files:**
- `app/_layout.tsx` — Wrapped the app tree with `PostHogProvider` (autocapture enabled for touches, manual screen tracking). Manual screen tracking via `usePathname` + `useGlobalSearchParams` sends `posthog.screen()` on every route change.
- `app/(auth)/sign-in.tsx` — Added `usePostHog`, `posthog.identify()` + `user_signed_in` capture on successful sign-in; `user_sign_in_failed` on errors.
- `app/(auth)/sign-up.tsx` — Added `usePostHog`, `posthog.identify()` with `$set`/`$set_once` + `user_signed_up` on successful account creation; `user_sign_up_failed` on errors.
- `app/(tabs)/settings.tsx` — Added `posthog.capture("user_signed_out")` + `posthog.reset()` before Clerk sign-out.
- `app/(tabs)/subscriptions.tsx` — Added `subscription_expanded` capture (with `subscription_id`, `subscription_name`, `subscription_category`, `source`) and debounced `subscription_searched` capture.
- `app/(tabs)/index.tsx` — Added `subscription_expanded` capture on the home screen with `source: "home_screen"`.

**Packages installed:** `posthog-react-native`, `react-native-svg`, `expo-file-system`, `expo-application`, `expo-device`, `expo-localization`.

## Events

| Event | Description | File |
|-------|-------------|------|
| `user_signed_in` | User successfully completes sign-in with email and password | `app/(auth)/sign-in.tsx` |
| `user_sign_in_failed` | User sign-in attempt failed due to an error | `app/(auth)/sign-in.tsx` |
| `user_signed_up` | User successfully creates a new account | `app/(auth)/sign-up.tsx` |
| `user_sign_up_failed` | User account creation attempt failed due to an error | `app/(auth)/sign-up.tsx` |
| `user_signed_out` | User signs out from their account via the Settings screen | `app/(tabs)/settings.tsx` |
| `subscription_expanded` | User expands a subscription card to view details on the Home screen | `app/(tabs)/index.tsx` |
| `subscription_expanded` | User expands a subscription card to view details on the Subscriptions screen | `app/(tabs)/subscriptions.tsx` |
| `subscription_searched` | User performs a search query on the Subscriptions screen | `app/(tabs)/subscriptions.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics:** https://eu.posthog.com/project/155175/dashboard/608810
- **Sign-up to Engagement Funnel:** https://eu.posthog.com/project/155175/insights/E6C1afRn
- **Daily Sign-ins & Sign-ups:** https://eu.posthog.com/project/155175/insights/QwNazlyU
- **Sign-in Failure Rate:** https://eu.posthog.com/project/155175/insights/fq3M3k6z
- **Subscription Engagement:** https://eu.posthog.com/project/155175/insights/g89fvovC
- **User Churn (Sign-outs):** https://eu.posthog.com/project/155175/insights/A08JQRaK

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
