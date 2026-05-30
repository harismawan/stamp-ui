import { afterEach } from 'bun:test';
import { GlobalRegistrator } from '@happy-dom/global-registrator';

GlobalRegistrator.register();

// Register the DOM before importing Testing Library (which touches `document`),
// then auto-unmount after every test so no rendered tree (or its styled-
// components rules) leaks into the next test and skews getComputedStyle.
const { cleanup } = await import('@testing-library/react');
afterEach(() => cleanup());
