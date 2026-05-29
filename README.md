# @harismawan/stamp-ui

A brand-agnostic React component library in the **"stamp" aesthetic** — chunky 2px
borders, hard offset shadows, flat fills, no gradients. Built with TypeScript +
styled-components.

## Install

```bash
bun add @harismawan/stamp-ui
# peers (provide your own):
bun add react react-dom styled-components
```

`react`, `react-dom`, and `styled-components` are **peer dependencies** — the
library expects a single shared instance of each (the theme is delivered through
styled-components' `ThemeProvider`).

## Quick start

Wrap your app in `StampProvider` (it sets up the theme + global styles), then use
components anywhere:

```tsx
import { StampProvider, Button, Card, CardTitle, CardValue } from '@harismawan/stamp-ui';

export function App() {
  return (
    <StampProvider mode="light">
      <Card>
        <CardTitle>Hello</CardTitle>
        <CardValue>stamp-ui</CardValue>
      </Card>
      <Button $variant="primary">Click me</Button>
    </StampProvider>
  );
}
```

## Theming

The library ships a default palette. Rebrand by passing your own theme (it must
satisfy the exported `Theme` type) to `StampProvider`:

```tsx
import { StampProvider, lightTheme, type Theme } from '@harismawan/stamp-ui';

const myTheme: Theme = { ...lightTheme, colors: { ...lightTheme.colors, primary: '#3B82F6' } };

<StampProvider theme={myTheme}>{/* ... */}</StampProvider>;
```

Light/dark mode is managed by the built-in `useThemeStore` (persisted). Omit
`mode` on `StampProvider` to let the store drive it.

## Components

- **Form:** `Button`, `Input`/`Select`/`Textarea`/`FieldWrap`/`FieldLabel`/`FieldError`, `NumberInput`, `Checkbox`, `Radio`/`RadioGroup`, `Switch`, `Slider`, `ColorPicker`, `IconPicker`
- **Display:** `Card`, `Badge`, `Tag`, `Avatar`/`AvatarGroup`, `Stat`, `EmptyState`, `Divider`, `Progress`, `Spinner`, `Skeleton`/`SkeletonText`/`SkeletonCircle`/`SkeletonGroup`, `Table` primitives
- **Overlays:** `Modal`, `Drawer`, `ConfirmDialog` (`confirmDialog`/`ConfirmViewport`), `Toast` (`toast`/`ToastViewport`), `Tooltip`, `Popover`, `Menu`/`MenuButton`/`MenuList`/`MenuItem`, `Alert`
- **Disclosure & nav:** `Tabs`, `Accordion`, `Breadcrumb`, `Pagination`, `Stepper`
- **Layout:** `Box`, `Stack`/`HStack`/`VStack`, `Grid`, `Container`
- **Hooks:** `useThemeStore`, `useDisclosure`, `useClickOutside`

## Development

```bash
bun install
bun test            # unit + a11y tests (happy-dom + @testing-library/react)
bun run typecheck   # tsc --noEmit
bun run build       # tsc -> dist/ (ESM + .d.ts)
bunx vite --config example/vite.config.ts example   # visual gallery of every component
```

## Publishing

Releases publish on a `v*` git tag via `.github/workflows/release.yml`. The repo
needs an `NPM_TOKEN` secret (an npm automation token with publish rights to the
`@harismawan` scope).

## License

MIT
