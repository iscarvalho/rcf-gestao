---
name: RCF Gestão
description: Internal events and cash ledger for Rio CrossFoto, a CrossFit photography company.
colors:
  tinta: "#14203a"
  tinta-suave: "#c3cbdb"
  background: "#f5f6f8"
  card: "oklch(1 0 0)"
  foreground: "#14203a"
  graphite: "#5a6782"
  hairline: "#e3e7ee"
  input: "#dde2ea"
  marca-azul: "#2a78d6"
  marca-azul-fundo: "#e6effc"
  marca-laranja: "#d9531a"
  marca-laranja-fundo: "#fdeee6"
  marca-magenta: "#b8286c"
  marca-magenta-fundo: "#fbe8f1"
  faixa-azul: "#2f80ed"
  faixa-laranja: "#f26a2e"
  faixa-magenta: "#e0418c"
  revenue-blue: "#2a78d6"
  outflow-orange: "#eb6834"
  loss-red: "oklch(0.577 0.245 27.325)"
  night-tinta: "#0b1222"
  night-marca-azul: "#6aaef5"
  night-marca-laranja: "#f39a66"
  night-marca-magenta: "#ef7fb4"
typography:
  display:
    fontFamily: "Space Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "3.75rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.05em"
    fontFeature: "tnum"
  headline:
    fontFamily: "Space Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    letterSpacing: "-0.025em"
  figure:
    fontFamily: "Space Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    letterSpacing: "-0.025em"
    fontFeature: "tnum"
  title:
    fontFamily: "Space Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.429
  label:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
rounded:
  md: "8px"
  lg: "10px"
  xl: "12px"
  2xl: "18px"
  pill: "9999px"
motion:
  entra: "fade + 14px rise, 0.6s cubic-bezier(0.2, 0.7, 0.2, 1)"
  cresce: "scaleY from 0, 0.9s, same easing"
  estica: "scaleX from 0, 0.9s, same easing"
  hover-lift: "translateY(-2px) + soft navy shadow, 200ms"
---

# Design System: RCF Gestão

## Overview

**Creative North Star: "Cores da marca"**

RCF Gestão still exists to put a number in front of a sócio, but it now looks like Rio CrossFoto. The navy of the logo frames every page as a header band; the logo's blue, orange and magenta appear as tinted accents; a sporty grotesk (Space Grotesk) carries titles and big figures. White cards sit on a cool gray page with a soft shadow, and the painel opens with its most important number in large type on a navy band, followed by cards that overlap the band.

The interface moves, a little: blocks rise in as they load, bars grow, ranking tracks stretch, and cards lift on hover. Motion is short, eases out and is always disabled under `prefers-reduced-motion`.

Built on shadcn/ui (Base UI primitives, Tailwind 4). Brand tokens live in `globals.css` as `--tinta`, `--marca-*` and `--marca-*-fundo`, exposed as Tailwind colors (`bg-tinta`, `text-marca-azul`, `bg-marca-magenta-fundo`).

## Colors

### Brand
- **Tinta** (`tinta`, navy `#14203a`): the header band and the painel band, primary buttons and body text. Replaces the old neutral ink.
- **Tinta suave** (`tinta-suave`): secondary text and inactive nav links on the navy band.
- **Marca azul / laranja / magenta** with their **fundo** tints: icon tiles in indicators, date tiles in próximos eventos, and the highlighted ring on a card. Always as a tinted tile (fundo + strong hue), never as a large fill.
- **Faixa azul / laranja / magenta**: brighter versions used only on the navy band (month bars, chips at 25% opacity). The current month's bar is magenta.

### Data
- **Revenue Blue** (`#2a78d6`, the same as marca azul): faturamento series and positive margin bars.
- **Outflow Orange** (`#eb6834`): saídas series.
- **Loss Red**: every negative number, form errors and destructive actions.

### Neutral
- **Background** `#f5f6f8`: the page. **Card** white: sections, indicators, popovers. **Graphite** `#5a6782`: secondary text and chart axes. **Hairline** `#e3e7ee`: borders and gridlines.

### Named Rules
**The Red Is Loss Rule.** A negative number is always Loss Red. Red is never decoration, and the brand magenta is never used for a negative value.

**The Tinted Tile Rule.** Brand hues appear as small tinted tiles (icon, date) or thin accents (rings, bars), not as large fills. The only large color field is the navy band.

**The Two Themes Rule.** Every `:root` token has a `.dark` counterpart in the same change.

## Typography

- **Display** (Space Grotesk 700, 3rem on mobile / 3.75rem from `sm`, tight tracking): the single hero figure on the painel band. The cents are set in Tinta suave.
- **Headline** (Space Grotesk 700, 1.5rem / 1.875rem): the page title in `CabecalhoPagina` and the painel band.
- **Figure** (Space Grotesk 700, scales with the card up to 1.75rem): indicator values.
- **Title** (Space Grotesk 600, 1.125rem): section headings.
- **Body / Label** (Geist): tables, lists, forms, nav, chips.

**The Tabular Figures Rule.** Every money value, date and count uses `tabular-nums`; money columns are right-aligned.

## Layout

A centered 64rem column (`max-w-5xl`). The header is a 64px navy band with the logo on a white tile, pill nav and "Sair". On the painel, the band continues under the header (`FaixaPainel`, full-bleed via a pseudo-element, with `overflow-x-clip` on the app shell) holding the title, the period pills, the hero figure, context chips and month bars. The indicator row then pulls up 56px to overlap the band. Every other page gets a compact version of the same band from `CabecalhoPagina` (`FAIXA`): back link, title, description and action, with just enough padding to give identity without pushing the records down. Actions on the band use `BOTAO_NA_FAIXA` (white button), and status badges turn translucent white. Sections follow in a `3fr / 2fr` grid from `lg`.

## Elevation & Motion

Cards rest with a very soft navy shadow (`0 2px 6px rgb(20 32 58 / 5%)`) and a hairline border. On hover, interactive cards lift 2px with a deeper shadow. Entry animations (`animate-entra`, `animate-cresce`, `animate-estica`, defined in `globals.css`) take a per-item `animationDelay` to stagger. Recharts bars animate in over 900ms.

## Components

- **Indicador:** white card, icon tile in a brand tone (`tom`: azul, laranja, magenta), graphite label, Space Grotesk figure, optional detail; `destaque` adds a magenta ring.
- **Secao:** white card, 18px radius, Space Grotesk title.
- **Navigation:** pill links on navy; the active link is a white pill with navy text.
- **Period filter:** the same pills inside a translucent white track on the navy band.
- **Ranking (margem por local):** position number, name, value and an animated track bar (blue, or red when negative). Above 10 locais, only the top 5 and bottom 5 show, with the full table in "Ver tabela".
- **Próximos eventos:** bordered rows with a date tile that cycles the three brand tones.
- **Status badges:** unchanged; weight, not color, carries the status.

## Do's and Don'ts

### Do:
- **Do** use the `--marca-*` tokens through Tailwind classes; keep raw hex only for the navy-band accents and chart series, with a comment.
- **Do** stagger entry animations with small delays (60–90ms per item) and keep them under a second.
- **Do** reuse `CabecalhoPagina`, `Secao`, `Indicador`, `Vazio`, `StatusEvento`, `FormAcao` and `CARTAO`.

### Don't:
- **Don't** use gradients, glows or decorative fills on cards.
- **Don't** animate anything that the user is reading or typing into, and never loop animations except loading pulses.
- **Don't** use brand magenta or orange to signal a loss; only Loss Red does.
