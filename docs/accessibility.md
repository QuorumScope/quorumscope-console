# Accessibility

This is a record of what was checked. It is not a compliance claim. No screen reader was run, and no person who depends on a keyboard or assistive technology tested the console.

## Structure

Checked on 2026-10-05 from the production build, by reading the DOM on the overview, network, keys, preflight (with a result), impact, status, freeze episodes, and developers pages.

- One `h1` per page, and no skipped heading levels. Panels are `h2`, subsections are `h3`.
- Landmarks: `header`, a labelled main `nav`, a labelled mobile `nav` (hidden with `display: none` when not in use), `main`, pagination `nav` elements with their own labels, and `footer`. A skip link is the first focusable element.
- Every form control has a label. The theme select has an `aria-label`. The preflight textarea has a visible label, a help paragraph, and an error message linked through `aria-describedby` with `aria-invalid`.
- The impact table has a caption and `th scope="col"` headers. The key history table does too.
- Each page has a distinct `<title>` and `lang="en"`.

## Status messages

- The preflight result sits in a polite live region, so a new result is announced.
- Preflight errors and local validation errors use `role="alert"`.
- The Freeze Map detail panel is a polite live region and announces the selected key.
- Freshness is not a live region. It is part of the page content.
- State is never carried by color alone. Freshness status has text, a distinct mark, and a different border style. Preflight status has text, a mark, and a different border style. Evidence classes have text and a different mark and border style.

## Freeze Map

The map is a group of focusable buttons with `aria-pressed`. Each has a label with the key kind and the full key hash. Enter and Space select a key. The same records are always in the evidence table on the page. On screens narrower than 720 px the map is hidden and the table is used.

## Motion

The console has no animation of its own. A `prefers-reduced-motion` rule shortens any animation and transition to near zero. Smooth scrolling is turned off under that preference.

## Contrast

Checked in two ways.

- `apps/web/tests/contrast.test.ts` reads the color tokens from `globals.css` and checks both themes. Text tokens must reach 4.5:1 against the page, panel, and secondary surfaces. The focus ring, form control borders, and map outlines must reach 3:1.
- axe `color-contrast` runs on the overview, network, keys, preflight, impact, and status pages in the light and dark themes.

The check found a real failure: form control borders used the decorative border color, at 1.5:1 in the light theme and 2.7:1 in the dark theme. A separate `--control-border` token now gives at least 4:1 in both themes, and the select and textarea use it. The measured values are in the test.

axe has no rule for non-text contrast, so those ratios are checked only from the tokens. Colors that come from the browser, such as the native checkbox, were not measured.

## Keyboard

`e2e/specs/keyboard.spec.ts` presses keys on real controls in each browser project. It covers: skip link, navigation with Enter and the current-page marker, the theme control with arrow keys, frozen key filters (select, checkbox with Space, apply with Enter), impact filters, Freeze Map selection with Space and Enter, the full preflight flow (type, Ctrl+Enter, Tab to the buttons, Clear with Enter), the mobile menu, and a visible focus outline on the main controls.

This is scripted keyboard use. It shows the controls are reachable and operable. It does not show that the tab order or the announcements feel right to a person.

## Known limits

- Two pages were not scripted for keyboard use: bypasses and freeze episode detail. They use the same links, lists, and pagination as the pages that were.
- The key hash and XDR blocks are focusable so they can be scrolled with a keyboard. They have labels but their long contents are not summarized.
- There is no copy button for identifiers. Values are selectable text.
- Narrow-screen layouts were checked for horizontal overflow at 375 px on the keys, preflight, and impact pages only.
