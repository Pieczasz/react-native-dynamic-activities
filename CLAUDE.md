# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React Native library for iOS Live Activities integration built with Nitro Modules. This is an iOS-only library that provides type-safe APIs for ActivityKit Live Activities with comprehensive error handling.

**Key Architecture:**
- **Nitro Modules**: JSI-based React Native native modules with type safety
- **iOS-only**: Android implementation is a stub that returns descriptive errors
- **ActivityKit Bridge**: Swift service layer abstracts ActivityKit complexity
- **Type-safe**: Full TypeScript + Swift type safety through Nitro codegen

## Essential Commands

### Build & Development
```bash
# Build the library
bun run build

# TypeScript type checking
bun run typecheck

# Code generation (after changing specs)
bun run codegen

# Install example app pods (run from repo root)
bun --cwd example pod
```

### Testing
```bash
# Run tests
bun run test

# Watch mode
bun run test:watch
```

### Linting & Formatting
```bash
# TypeScript/JavaScript
bun run lint          # Biome linting
bun run format        # Biome formatting

# Native code
bun run lint:swift    # SwiftLint
bun run lint:kotlin   # ktlint
bun run format:swift  # SwiftFormat
bun run format:clang  # clang-format

# All formats/lints
bun run lint:all
bun run format:all
```

### Example App (iOS)
```bash
cd example
bun i
bundle install
bundle exec pod install --project-directory=ios
bun run ios
```

## Code Architecture

### Core Structure
- `src/specs/` - Nitro TypeScript specifications (generate native bindings)
- `ios/` - Swift implementation and services
- `android/` - Stub implementation (rejects with clear errors)
- `nitrogen/generated/` - Generated Nitro bindings (do not edit manually)
- `lib/` - Built output (do not edit manually)

### Key Components

**Bridge Layer:**
- `ios/HybridDynamicActivities.swift` - Main Nitro bridge, handles JS ↔ Swift conversion
- Maps native ActivityKit errors to standardized JS errors
- All async operations return Nitro `Promise<T>`

**Service Layer:**
- `ios/Services/ActivityKit/LiveActivitiesService.swift` - Core ActivityKit logic
- Handles activity lifecycle: start, update, end
- Version compatibility checks and feature gating

**Type System:**
- `src/specs/LiveActivities.nitro.ts` - Main API surface and types
- `src/specs/LiveActivitiesErrors.nitro.ts` - Comprehensive error types
- JS types should semantically match Swift `ActivityAttributes` and `ContentState`

## Nitro Modules Workflow

**Critical: After changing any `.nitro.ts` spec files:**

1. Run `bun run codegen` to regenerate native bindings
2. Update native implementations in `ios/` and `android/`
3. Run `bun run build` to rebuild library
4. Test changes in example app

**Generated files (never edit manually):**
- `nitrogen/generated/**`
- `lib/**`

## Development Guidelines

### Type Safety
- Maintain strict TypeScript settings (noUncheckedIndexedAccess, etc.)
- JS/TS types in specs must align with Swift ActivityAttributes/ContentState
- Use Nitro's type-safe JSI bindings, avoid `any`

### Error Handling
- All native errors mapped to structured JS errors with codes
- Authorization errors (user permissions) vs system errors (iOS limitations)
- Use `LiveActivityErrorFactory` for consistent error creation

### iOS Version Compatibility
- Minimum iOS 16.2 (ActivityKit requirement)
- Feature gating for newer iOS versions (e.g., `style` requires iOS 18.0+)
- Version checks in `areLiveActivitiesSupported()`

### Testing
- Unit tests in `src/__tests__/`
- Mock native layer for testing JS contract
- Example app for integration testing on device

## Configuration Details

**Biome (Linting/Formatting):**
- Config: `config/biome.json`
- 2-space indentation, 100-char line width
- Excludes generated code and build outputs

**TypeScript:**
- Config: `config/tsconfig.json`
- Strict mode with comprehensive checks
- Composite project setup for monorepo

**Commitlint:**
- Conventional commits enforced
- Types: feat, fix, docs, chore, etc.
- Husky pre-commit hook validation

## Important Notes

- **iOS-only library**: Android methods reject with descriptive errors
- **Widget Extension required**: Example app needs Widget Extension + Live Activities entitlement in Xcode
- **Device testing**: Simulator has limited Live Activities support; test on physical device
- **Nitro dependency**: Requires `react-native-nitro-modules` peer dependency
- **ActivityKit constraints**: Live Activities have iOS system limits and user permission requirements