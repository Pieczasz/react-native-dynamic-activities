# Contributing to react-native-dynamic-activities

Thanks for your interest in contributing! This project aims to provide a high-quality, type-safe, iOS-first React Native library for Live Activities using Nitro Modules.

Quick links:

- Nitro Modules docs: [nitro.margelo.com](https://nitro.margelo.com/)

## Development environment

- Node 18+
- React Native 0.76+ (dev uses 0.80)
- Xcode 15+
- Ruby + Bundler for CocoaPods
- bun (optional, used in some scripts)

## Getting started

1. Clone and install dependencies:
   ```bash
   git clone https://github.com/pieczasz/react-native-dynamic-activities.git
   cd react-native-dynamic-activities
   npm i
   ```

2. Codegen and build the library when changing specs or native surface:
   ```bash
   npm run codegen
   ```

3. Run tests, lint, typecheck:
   ```bash
   npm run test
   npm run lint
   npm run typecheck
   npm run build
   ```

4. Example app (iOS):
   ```bash
   cd example
   npm i
   bundle install
   bundle exec pod install --project-directory=ios
   npm run ios
   ```

Note: The Example requires a Widget Extension and the "Live Activities" capability enabled in Xcode to show the system UI (Lock Screen/Dynamic Island). See README for details.

## Working with Nitro Modules (codegen workflow)

This library uses Nitro Modules for type-safe, JSI-based native bindings. Changes to TypeScript specs or native types require regenerating bindings.

1. Edit specs in `src/specs/*.nitro.ts`.
2. Run codegen: `npm run codegen`.
   - This updates `nitrogen/generated/**` (do not edit), rebuilds the package, and runs a small post-script.
3. Implement native changes:
   - iOS: `ios/HybridDynamicActivities.swift` (bridge) and `ios/Services/**` (logic)
   - Android: Stub only (rejects with a clear error; iOS-only feature)
4. Re-run `npm run build` and tests.

Important:

- Do not edit files under `nitrogen/generated/**` or `lib/**` — they are generated.
- Keep JS/TS types in `src/specs/*` semantically aligned with your WidgetKit `ActivityAttributes` and `ContentState` fields.
- Prefer small, focused specs and clear JSDoc comments. Nitro generates type-safe Swift/Kotlin signatures from your TS types.

## Project structure

- `src/` TypeScript entry points and Nitro specs
- `ios/` Native Swift implementation and services
- `android/` Stub implementation (iOS-only feature)
- `nitrogen/` Generated code by Nitro (do not edit manually)
- `example/` Example React Native app
- `scripts/` Local format/lint helpers for Swift/Kotlin/Clang
- `config/` Shared configs for TypeScript/Biome (plus optional native format configs)

## Coding guidelines

- TypeScript strict mode; avoid `any`
- Prefer functional components and hooks
- Follow existing naming and error-handling patterns
- Keep bridge payloads minimal
- Add/extend tests for all public APIs

## Linting, formatting, and native tooling

JS/TS:

- Biome for lint/format: `npm run lint`, `npm run format`

Swift/Kotlin/Clang (optional but recommended locally):

- SwiftLint: `brew install swiftlint`
- SwiftFormat: `brew install swiftformat`
- ktlint: `brew install ktlint`
- clang-format: `brew install clang-format`

Convenience scripts:

- Format native: `npm run format:native` (Swift + Clang)
- Lint native: `npm run lint:native` (SwiftLint + ktlint)
- All: `npm run lint:all` and `npm run format:all`

Configs expected by scripts:

- `config/.swiftformat`
- `config/.clang-format`

If these files are missing, add minimal configs or update the script paths. Example minimal `config/.swiftformat`:

```
--swiftversion 5.9
--indent 2
```

Example minimal `config/.clang-format`:

```
BasedOnStyle: LLVM
IndentWidth: 2
ColumnLimit: 120
```

Note: Some scripts use `bun run` for chaining; Bun is optional. If you don't use Bun, just run the underlying npm scripts individually.

## Tests

- Unit tests live in `src/__tests__/**`. Run with `npm run test` or `npm run test:watch`.
- Mock native as needed — Nitro surface is thin, so most logic is validated at the JS contract level.
- Aim to cover:
  - Positive flows: start -> update -> end
  - Error mapping: authorization vs. system errors
  - Version-conditional behavior (guarded by `areLiveActivitiesSupported()`)

## Making changes (suggested workflow)

1. Create a topic branch: `feat/...`, `fix/...`, or `docs/...` following Conventional Commits.
2. If changing specs or native surface:
   - Edit `src/specs/*.nitro.ts`
   - `npm run codegen`
   - Implement iOS logic in `ios/Services/**` and bridge in `ios/HybridDynamicActivities.swift`
3. Update or add tests in `src/__tests__/**`.
4. Lint/format: `npm run lint:all && npm run format:all`
5. Build and type-check: `npm run build && npm run typecheck`
6. Verify the example app (iOS): run on a physical device for Dynamic Island.

## Pull Request checklist

- [ ] Follows Conventional Commits in title (e.g., `feat:`, `fix:`, `docs:`)
- [ ] Tests added/updated for public API changes
- [ ] Types updated and exported from `src/index.ts` where applicable
- [ ] Ran `npm run codegen` if specs/native surface changed
- [ ] Lint/format/build/typecheck pass locally
- [ ] README and API docs updated if behavior changed
- [ ] Example app verified (for user-facing changes)

## Releasing

- We use release-it + conventional changelog. Maintainers will run:
  ```bash
  npm run release
  ```
- Versioning follows semver. Pre-1.0 minor may include breaking changes (documented in changelog).

## Platform notes

- iOS only. Android is a stub and returns a descriptive error.
- Minimum iOS: 16.2 (ActivityKit). Some features require newer versions (see README and TS spec docs).
- Minimum RN for Nitro: 0.76+. Dev uses 0.80.

## Troubleshooting

- Clear Metro cache: `npm run start` with `--reset-cache`
- If Nitro codegen issues occur, re-run `npm run codegen` and clean build in Xcode
- If pods fail, run `bundle exec pod repo update` then reinstall
- Missing native format configs: add `config/.swiftformat` and/or `config/.clang-format` or edit scripts to point to your paths.
- No widget shown: ensure a Widget Extension exists and Live Activities capability is enabled.

### Commitlint setup (local + CI)

- Local (Husky):
  ```bash
  npm i -D husky @commitlint/cli @commitlint/config-conventional
  npx husky init
  # Hook is already created in .husky/commit-msg (uses bunx if available)
  ```
- CI (GitHub Actions): Commit messages are validated on push/PR (see `.github/workflows/ci.yml`).
- Guides: [CI setup](https://commitlint.js.org/guides/ci-setup.html), [Local setup](https://commitlint.js.org/guides/local-setup.html)

Thanks again for contributing!
