import { GlobalRegistrator } from '@happy-dom/global-registrator';

GlobalRegistrator.register();

// Bun's test runner does not auto-wire Testing Library's afterEach cleanup
// (that hook is normally injected by jest/vitest globals). Without it, mounted
// trees accumulate across tests in the same file and queries like getByRole
// can match leftover nodes from a prior test. Register cleanup explicitly so
// each test starts from an empty document.
const { cleanup } = await import('@testing-library/react');
const { afterEach } = await import('bun:test');
afterEach(() => {
  cleanup();
});
