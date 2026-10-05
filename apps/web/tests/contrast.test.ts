import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// Reads the design tokens from globals.css and checks WCAG contrast ratios for both themes.
const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');

function tokens(block: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const match of block.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})/g)) out[match[1] as string] = match[2] as string;
  return out;
}

function between(start: string, end: string): string {
  const from = css.indexOf(start);
  assert.notEqual(from, -1, start);
  return css.slice(from, css.indexOf(end, from));
}

const light = tokens(between(':root {', '}'));
const dark = tokens(between(':root[data-theme="dark"] {', '}'));
const darkSystem = tokens(between('@media (prefers-color-scheme: dark) {', '\n}'));

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255) as [number, number, number];
  const f = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function ratio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

const text: Array<[string, string]> = [];
for (const fg of ['text-1', 'text-2', 'accent', 'critical']) for (const bg of ['background', 'surface-1', 'surface-2']) text.push([fg, bg]);
text.push(['surface-1', 'accent']);

// Non-text parts need 3:1: focus ring, form control borders, map node outlines.
const nonText: Array<[string, string]> = [];
for (const bg of ['background', 'surface-1', 'surface-2']) {
  nonText.push(['focus', bg], ['control-border', bg], ['accent', bg]);
}

for (const [name, theme] of [['light', light], ['dark', dark], ['dark (system preference)', darkSystem]] as const) {
  test(`${name} theme: text tokens meet 4.5:1`, () => {
    for (const [fg, bg] of text) {
      const r = ratio(theme[fg] as string, theme[bg] as string);
      assert.ok(r >= 4.5, `${fg} on ${bg} is ${r.toFixed(2)}`);
    }
  });
  test(`${name} theme: focus ring, control borders, and outlines meet 3:1`, () => {
    for (const [fg, bg] of nonText) {
      const r = ratio(theme[fg] as string, theme[bg] as string);
      assert.ok(r >= 3, `${fg} on ${bg} is ${r.toFixed(2)}`);
    }
  });
}

test('the dark tokens in the system preference block match the explicit dark theme', () => {
  assert.deepEqual(darkSystem, dark);
});
