# Design system

QuorumScope uses a quiet operational layout with clear ledger evidence. The current build uses system Arial and Helvetica for interface text and the browser's system monospace stack for identifiers. These fonts add no third-party loading or font license dependency.

The source of light and dark colors is `apps/web/app/globals.css`. Semantic tokens control the background, surfaces, text, border, accent, focus, and critical state. The system theme follows the operating system. An explicit choice is stored under `quorumscope-theme` and loaded before hydration by a local static script.

The original four-corner mark represents four inspection quadrants around a central aperture. It is a simple one-color SVG in repository code. It does not imply Stellar endorsement.

Layout width is capped at 1160 pixels. Technical identifiers wrap inside facts and records. The mobile header wraps navigation into multiple rows. Focus uses a visible outline, and reduced-motion preference removes nonessential motion.
