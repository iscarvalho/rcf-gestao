# Case: Management system for CrossFit photography

Nov 19, 2026 · @Italo

## Context

An internal event and finance management system for a CrossFit photography company, built around Banlek rather than in place of it.

The company photographs competitions and events at CrossFit boxes. Today, each event follows this flow:

1. Photograph the event.
2. Move the photos from the card into Lightroom, which pre-selects them with AI (Assisted Culling).
3. Publish the photos on Banlek, which sells them to athletes using facial recognition.

Producing and selling the photos is already well covered by off-the-shelf tools. What has no tool is everything between those steps: who covered which event, how much it cost, how much it sold, and how the company's cash stands.

## Pain points

The main pain is not knowing, quickly and reliably, how much each event earned and how the company's cash stands.

| Pain point | How it works today | Impact |
| --- | --- | --- |
| Company cash | Money in and out is scattered across Banlek, notes and spreadsheets | No balance or result per period without assembling everything by hand |
| Scattered revenue | Sales live on Banlek, and the export lists purchases per buyer, not the total per event | Sales have to be added up and assigned manually |
| No integration | Banlek has no API | Any consolidation depends on manual entry or file imports |
| No business view | There is no consolidated history of venues, events and sales | It's hard to tell which boxes and events are worth it |
| Ongoing sales | An event keeps selling after it is published | Totals need to be updated from time to time |

## Decisions and rationale

The rule was to build only what no current tool solves, and to integrate with the tools the company already uses.

| Idea | Decision | Why |
| --- | --- | --- |
| Sell photos on our own system | Dropped | Banlek already sells with facial recognition and has the audience |
| AI photo culling | Dropped for now | Lightroom already pre-selects with AI, and the gain would be marginal |
| Scraping the Banlek dashboard | Dropped | Fragile, breaks with every site change and may violate the terms of use |
| Event and company cash management | Chosen | That's where the manual work and the lack of business visibility are |
| Importing the sales export | Chosen | Works around the missing API using a file Banlek already offers |
| Payouts between partners | Postponed | The company-wide view comes first; each event already records its person in charge so payouts can come later |

## Solution

The MVP brings venues, events, sales and payouts together in one place, fed by an initial load and periodic imports.

**MVP features**

- **Venues and clients:** boxes and organizers, with city and contact.
- **Events:** venue, date, person in charge, status (scheduled, photographed, published on Banlek, closed).
- **Event costs:** registration, travel, food and others.
- **Sales:** imported from the Banlek export or entered as an accumulated total.
- **Cash:** money in (sales) and out (event costs and general company expenses), with a balance per period.
- **Dashboard:** revenue, costs and result per event, per venue and per month, and the cash balance.

**Initial load (once)**

A template spreadsheet with three tabs (Venues, Events and Sold so far) brings the current history into the system. The importer validates references and shows a preview before saving.

**Periodic update**

1. She exports the sales from Banlek, per buyer.
2. The system assigns each sale to an event, by gallery name when available or by the date window after the event.
3. Sales already imported are skipped, so overlapping periods don't duplicate amounts.
4. A review screen shows ambiguous sales for her to assign by hand.
5. For older events that only have a total, she enters the new accumulated amount and the system records the difference.

Open question:

- Which columns does the Banlek export include (is there an event or gallery name)?

## Technical architecture

A Next.js web app on Supabase, with an importer that works around Banlek's missing API.

&#91;embedded content: architecture · data input, importer, database and app\]

The spreadsheet and the export go through the importer before reaching the database; the app reads from and writes to Supabase directly.

| Layer | Choice | Rationale |
| --- | --- | --- |
| Front end | Next.js + TypeScript, shadcn/ui | A stack I know well; responsive UI for entering costs from a phone at the event |
| Database and auth | Supabase (Postgres, Auth, Row Level Security) | Ready-made relational database, login and per-partner access control |
| Import | Server-side CSV/Excel parsing, validation with Zod | Format errors show up in the preview, before saving |
| Charts | Recharts | Lightweight dashboard, no external service |
| Tests | Playwright (E2E) on the import and cash flows | Those are the flows where a mistake costs money |

**Data model**

- `locais` — box or organizer, city, contact.
- `pessoas` — partners and photographers.
- `eventos` — venue, date, person in charge and status.
- `custos` — event, type, amount.
- `despesas` — general company expenses, not tied to an event (equipment, subscriptions).
- `vendas` — event, buyer, amount, date and a unique identifier for deduplication.
- `importacoes` — file, date and rows read, saved and skipped.

**Technical decisions**

- Cash is the company as a whole: money in is sales, money out is event costs and general expenses.
- Each event already stores its person in charge, so payouts can be added later without changing the model.
- Each sale has a unique key (order ID, or date + buyer + amount), so re-importing the same period never duplicates amounts.
- Every import is recorded; a wrong import can be undone, and sales can be followed over time.
- Revenue, result and balance are calculated from sales and costs, never typed in, so there is a single source of truth.

## Product and business value

The system replaces spreadsheets and hand calculations with reliable numbers per event, which helps decide which events and boxes to invest in.

| For whom | Gain | How to measure |
| --- | --- | --- |
| Partners | Result of each event and cash balance without manual math | Time to close an event or a month |
| Partners | Knowing which boxes and events return the most | Revenue and profit per venue and per event |
| Operations | Venue and contact history in one place | Recurring events per venue |
| Sales | Arguments to sell the next event to the box | Athletes who bought and average ticket per event |
| Marketing | Knowing when to promote, based on how sales evolve after the event | Sales curve per day after publishing |

As a portfolio piece, the project shows a full product cycle: a real problem, a real user, scope cut with judgment, and integration with a system that has no API.

## Roadmap, risks and next steps

Delivery is incremental: each phase is usable on its own, and the first one takes control out of the spreadsheet.

&#91;embedded content: roadmap · 4 phases, no dates\]

The phases follow dependency order: there is no cash without events and sales, and payouts start from a closed cash position.

**Risks**

| Risk | Mitigation |
| --- | --- |
| The Banlek export changes format | The importer validates columns and warns before saving; column mapping lives in a single place |
| Sales with no clear event | Assignment by date window and a manual review screen |
| Low day-to-day adoption | Quick entry from a phone and an initial load built from what she already has |

**Next steps**

- [ ] Get the header of a real Banlek export
- [ ] Gather the venues, events and costs already done for the initial load
- [ ] Build the data model and phase 1
