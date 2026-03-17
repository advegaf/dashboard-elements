/**
 * LEDGR oklch Color Palette Reference
 *
 * 8 active scales (used in theme.css):
 *   gray(0), green(145), red(17), gold(75), blue(210), purple(295), orange(55), teal(180)
 *
 * 7 supplementary scales (available for future use):
 *   lime(91), emerald(120), cyan(165), indigo(264), violet(275), pink(343), coral(25)
 *
 * Scale structure: 12 steps per hue
 *   Steps 1-4:  dark backgrounds (L 0.08-0.22, C 0.01-0.05)
 *   Steps 5-8:  mid tones      (L 0.30-0.54, C 0.06-0.15)
 *   Step  9:    primary accent  (L ~0.62-0.73, C ~0.18 — peak chroma)
 *   Steps 10-12: light/contrast (L 0.72-0.92, C 0.06-0.15)
 */

export const supplementaryHues = {
  lime:    91,
  emerald: 120,
  cyan:    165,
  indigo:  264,
  violet:  275,
  pink:    343,
  coral:   25,
} as const;
