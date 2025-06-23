# Plan to Wrap Up Frontend App

## Notes
- Goal is to finalize the frontend app for deployment (Vercel/Render).
- User wants a proper end to the game, with reset of puzzle and profile.
- Need a smooth flow: new users go to signup with cartridge controller.
- Add guards to protect routes and redirect unauthenticated users to signup.
- Minimal changes, focus on polish and user experience.
- Frontend directory structure: `src/`, `components/`, `hooks/`, `lib/`, `types/` identified.
- `WalletConnectionGuard` is already used in `layout.tsx` for global route protection.
- Key files/components for flow and end-game logic reviewed: `WalletConnectionGuard`, `GameHeader`, `VictoryModal`, constants, and game progression logic.
- `exit.svg` icon not found in public assets; need to choose or add a suitable replacement (e.g., `close.svg`, `chevron-left.svg`, or similar).
- User requested a disconnect wallet button; logic exists in `WalletAccount` component.
- New requirement: integrate the contract's add batch puzzle function into the dashboard for post-deployment puzzle creation.

## Task List
- [ ] Analyze current frontend structure and flow.
  - [x] List and review main frontend directories.
  - [x] Review main layout and global guards.
  - [x] Review key files/components for flow and end-game logic.
  - [x] Map routes and user flow.
- [ ] Design end-of-game logic: reset puzzle, profile, and return to main/start screen.
- [ ] Implement a signup flow for new users with cartridge controller.
- [ ] Add route guards to check user connection/authentication.
- [ ] Redirect unauthenticated users to signup page.
- [ ] Test the full user journey (first-time and returning users).
- [ ] Polish UI/UX for deployment.
- [ ] Add/replace exit icon asset as needed.
- [ ] Add a disconnect wallet button to the UI.
- [ ] Integrate add batch puzzle contract function in /dashboard for post-deployment puzzle creation.

## Current Goal
Integrate add batch puzzle contract function in /dashboard for post-deployment puzzle creation.