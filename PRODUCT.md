# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

RCF Gestão is the internal events and cash system of Rio CrossFoto, a company that photographs CrossFit championships and events held at boxes. Logins are only for the team, and public sign-up is turned off.

- **Sócios (partners)** run the business side. They register locais, eventos and pessoas, paste the cumulative sales totals from the Banlek panel, log general expenses, and read the painel to see what each event earned and how the cash stands.
- **Fotógrafos (photographers)** also use the app. Their main job is logging event costs (inscrição, deslocamento, alimentação) from their phones, at or right after the event.

Usage splits by task. Cost entry happens on the phone in the field. The painel, the Banlek sales updates and the registers are mostly used on a desktop.

## Product Purpose

The app answers, quickly and reliably, how much each event made and how the company's cash stands. Before it existed, entries and exits were scattered across Banlek, notes and spreadsheets.

It sits **around** the tools the company already uses and does not replace them. Lightroom handles culling, and Banlek sells the photos to athletes with facial recognition. RCF Gestão covers what falls between those steps: who shot which event, what it cost, what it sold, and the company's cash.

Success means the sócios can close an event or a month without doing the math by hand, and can tell which boxes and events are worth repeating.

## Positioning

A small, purpose-built ledger for a photography business that sells through Banlek, a platform with no API. It works around that gap with the cumulative-total and CSV-import workflow instead of scraping. Revenue, results and balances are always calculated from sales and costs, never typed in, so the numbers have a single source of truth.

## Operating Context

- **Event lifecycle:** agendado → fotografado → publicado na Banlek → fechado. An event keeps selling after it is published, so totals get updated from time to time.
- **Sales updates:** a sócio copies an event's new cumulative total from the Banlek panel into `/vendas` or the event page. The system records only the difference, dated today, so the monthly chart shows when the money came in. A total lower than the one already recorded is refused.
- **Import:** `scripts/carga-banlek.mjs` loads Banlek's event-list CSV, creates locais and eventos from the titles, and is idempotent. A per-buyer sales export import with a review screen for ambiguous sales is planned. Which columns the Banlek export contains is still an open question.
- **Cash:** the company is treated as one whole. Money in is sales. Money out is event costs plus general expenses (equipamento, software, marketing, transporte, impostos, outros).
- **Field entry:** cost entry happens at the event on a phone, often in a hurry, standing up, and maybe on a poor connection.

## Capabilities and Constraints

- **Shipped:** login, locais (boxes and organizers with city, bairro, UF and contact), pessoas (sócios and fotógrafos who can be deactivated without losing history), eventos (local, date, responsável, status, Banlek gallery name), custos por evento, vendas (cumulative-total updates and an entry list with removal), despesas (grouped by month and category), and the painel (faturamento, saídas, resultado, saldo de caixa, monthly chart, results by local and by event, próximos eventos, 3/6/12-month filter).
- **Deferred:** repasses between sócios. Each event already stores its responsável so repasses can be added later.
- **Stack:** Next.js 16 App Router with Server Actions and Cache Components, TypeScript, shadcn/ui on Base UI, Tailwind 4, Supabase (Postgres, Auth, RLS), Zod, Recharts and Sonner.
- **Locale:** Brazilian Portuguese only. Money is in BRL with `1.234,56` input formatting. UI terms follow the domain vocabulary: locais, pessoas, eventos, custos, vendas, despesas, painel, faturamento, resultado, saldo.
- **Open decision:** RLS currently gives every authenticated team member full access to everything, financial data included. Nobody has decided yet whether fotógrafos should see the painel and company finances or only their own cost entry.

## Brand Commitments

- Name: **RCF Gestão** (company: Rio CrossFoto). Logo at `src/assets/logo.png`, plus the app icons in `src/app/icon.png` and `src/app/apple-icon.png`.
- Voice: plain, direct Portuguese, written for the team rather than for customers.

## Evidence on Hand

- Real Banlek event history loaded through `scripts/carga-banlek.mjs`, and a demo mock in `supabase/mock` with a cleanup script.
- `docs/case.md`, which covers the context, pains, decisions, architecture and roadmap.
- No external customers, testimonials or metrics. The app is internal, so none should be invented.

## Product Principles

1. **Integrate, don't replace.** Build only what Banlek and Lightroom don't already do, and lean on the files and panels those tools already provide.
2. **Numbers are derived, never typed.** Faturamento, resultado and saldo come from sales and costs. The UI should make it obvious where each number comes from.
3. **Fast in the field.** Logging a cost on a phone at an event has to take seconds, and it is the main way adoption is kept up.
4. **Trustworthy money.** Flows that touch money (imports, sales updates, cash) refuse anything ambiguous and show what will change before it is saved.
5. **Internal tool first.** The design serves the people who use it every day. The project's value as a portfolio piece never drives decisions.
