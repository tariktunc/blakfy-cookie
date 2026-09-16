---
"@blakfy/cookie": minor
---

Preferences modal: fit the screen on mobile and keep the action bar reachable

The modal used to size itself with `100vh` and scroll as a single box. On a phone that
meant the card was taller than the visible area (100vh excludes the retractable URL bar)
and the Save / Accept All buttons scrolled out of view with everything else, so a choice
could only be committed by scrolling back down to find them.

The card is now a flex column that clips, with one scrolling box inside it
(`.blakfy-card-body`) holding the tab panels. The tab bar stays above it and the action
bar below it, both outside the scroll area — neither can scroll away. `position: sticky`
was tried first and did not hold in this structure, so the layout answers it instead.

Also in this change:

- Card height is capped with `100dvh` (`100vh` kept as the fallback), which tracks the
  viewport the user can actually see.
- On a phone the panel is 85% of the screen wide, and at most 75% of it tall. The height
  is a cap rather than a fixed size: a tab with little content stays short, and only one
  with more content than fits grows to 75% and scrolls from there. Both a narrow-width and
  a short-height query are used: portrait phones are narrow but tall, landscape phones are
  wide but short, and a single query misses one of them.
- The service and cookie lists no longer scroll independently on short viewports. Nested
  scroll regions trap touch gestures — a drag starting over the inner list moved only that
  list, leaving the rest of the panel unreachable. There is now one scroll surface.
- On short viewports the action buttons stay on one row and the card padding tightens, so
  the bar cannot grow tall enough to crowd out the content. The 44px touch-target floor
  (WCAG 2.2 SC 2.5.8) is unchanged.
- `overscroll-behavior: contain` stops a scroll that reaches the end of the list from
  chaining to the page behind the overlay, and the bar reserves `safe-area-inset-bottom`
  so it clears the home indicator on notched phones.

Save / Accept All now sit at card level rather than inside the Categories panel, so they
are available from every tab — switching individual services off under "Services" and
saving from there no longer requires a trip back to "Categories".
