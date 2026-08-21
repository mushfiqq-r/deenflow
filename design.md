# DeenFlow Interface Design

## Product direction

DeenFlow is a private, local-first companion for intentional daily worship, character, wellbeing, and voluntary remembrance. It uses a quiet emerald-and-sand visual language, generous spacing, clear progress feedback, and predictable controls. The experience is designed for **portrait, one-handed use** at 9:16, with primary actions placed at the bottom or within comfortable thumb reach. Content remains readable at normal system text sizes and reflows for compact Android screens.

## Screen list

| Screen | Primary content and functionality |
|---|---|
| Checklist | A selected-day strip; daily completion ring and points; editable task categories; task rows with completion, point value, plus/minus contribution controls, and contextual edit action; a weekly checklist section; category/task creation sheets. |
| Investment | A selected-day strip; cumulative reward overview grouped by user-defined reward units; Adhkar list; an Add New flow that captures dhikr, meaning, blessings, per-session target, reward value, and reward unit; a detail screen with tapping counter and manual-entry adjustment. |
| Adhkar detail | Full dhikr context, daily count, target progress, calculated reward, tap area, manual count control, and day-specific entry history. |
| Performance | Weekly, monthly, and yearly summaries; a completion trend visualization; checklist versus investment snapshot; a rule-based insight that detects momentum, consistency, and opportunities to improve. |
| Settings | Light, dark, and AMOLED display choices; intelligent accent choices; local export/share and reviewed import; a clear-data confirmation flow; privacy note. |

## Primary user flows

| Flow | Steps |
|---|---|
| Complete a checklist task | Select a date in the week strip → tap the task completion circle → the day score and category progress update → use plus/minus when a task has partial or repeatable contribution. |
| Create a checklist category or task | Tap the floating Add button → choose category or task → complete the concise form → save locally → view it immediately in the relevant category. |
| Add an Adhkar investment | Investment → Add New → enter dhikr, meaning, blessings, target, reward value → select Trees, Blessings, Treasures, Slave-Freeing, Quran Completion, or Custom → save. |
| Record Adhkar | Investment → tap a dhikr → tap the large counter area for one repetition or use the manual +/- counter → calculated reward changes in real time → entry is associated with the selected day. |
| Review historical entries | Select an earlier day in the date strip on Checklist or Investment → the screen resolves the exact stored tasks, counts, points, and reward totals for that date. |
| Analyze progress | Open Performance → switch weekly, monthly, or yearly timeframe → see completed-task rate, points/rewards, trend bars, and an evidence-based coaching insight. |
| Backup or restore | Settings → Export to create a portable local backup → Import → inspect counts and timestamp in review dialog → confirm replacement only after review. |

## Color and visual language

| Token | Light mode | Dark mode | AMOLED mode | Intended role |
|---|---:|---:|---:|---|
| Forest | `#166534` | `#4ADE80` | `#65E89A` | Primary action and success progress |
| Sand | `#F7F7F2` | `#111512` | `#000000` | App background |
| Card | `#FFFFFF` | `#182019` | `#0B0B0B` | Content surfaces |
| Ink | `#192019` | `#F1F6EE` | `#F4F7F3` | Main text |
| Mist | `#687268` | `#A9B3A8` | `#A8B0A7` | Secondary text |
| Amber | `#BF7B15` | `#F0B650` | `#F6C95D` | Highlight / reward accent |

The default accent is Forest. Settings includes three smart alternatives chosen for contrast across all display modes: Ocean (`#0F766E`), Indigo (`#4F46E5`), and Plum (`#9D174D`). Icons are outlined and concise; cards use a 16px corner radius, thin borders, and restrained shadows. Destructive actions use explicit copy and a second confirmation rather than relying on color alone.

## Information architecture and interaction conventions

Bottom navigation contains four labeled tabs: **Checklist**, **Investment**, **Performance**, and **Settings**. The selected date is visible near the top of checklist and investment screens. All state remains on-device by default; no sign-in or cloud service is required. Repetitive numeric actions have visible plus and minus buttons paired with a direct numeric input where appropriate. Forms open in modal sheets so the user can save or discard changes without losing context.
