# LEDGR — 12-Week MVP Roadmap

## Week 1: Supabase Foundation + Auth
- Initialize Supabase (local Docker + hosted)
- Database schema: 10 tables with multi-gym support from day one
- RLS policies for tenant isolation
- Seed data: 1 gym, 1 owner, 35 members, 4 plans
- Move auth UI to `src/auth/`, wire to Supabase Auth
- Email/password + magic link login
- ProtectedRoute, AuthProvider, routing

## Week 2: Live Data Layer
- Replace mock `MembersContext` with Supabase queries
- CRUD operations for members (add, edit, status changes)
- Wire dashboard cards to real aggregation queries
- Pagination with Supabase `.range()`
- Search and filter via Supabase full-text / ilike
- Optimistic UI updates

## Week 3: Stripe Integration (Billing Core)
- **Pre-req**: Stripe Platform account approved (Express Connect)
- Connect gym's Stripe account via onboarding flow
- Create Stripe Products + Prices for the 4 plans
- Subscription creation flow (member → plan → Stripe)
- Webhook endpoint for payment events
- Update `billing_status`, `payment_method`, `revenue` from Stripe data

## Week 4: Stripe Integration (Payments UI)
- Payment history view per member
- Invoice / receipt display
- Failed payment handling + retry logic
- Past-due → frozen auto-transition (grace period)
- Revenue dashboard card wired to real payment data

## Week 5: Access Control (Scanner)
- RS-232 serial bridge on gym PC
- Code 128 barcode scanning
- Edge function: validate barcode → check member status → grant/deny
- Access event logging
- Real-time door status indicator

## Week 6: Access Control (UI + History)
- Check-in history per member in detail drawer
- Recent check-ins dashboard card wired to `access_events`
- Access denied alerts (frozen/cancelled/unknown)
- Daily/weekly visit heatmap from real data

## Week 7: ABC Migration Tool
- CSV import parser for ABC Fitness data
- Member matching / dedup logic
- Migration tracking table UI
- Payment link generation for migrating members
- Bulk email/SMS with payment links

## Week 8: Member Self-Service
- Note: gym members never log in (staff-only auth)
- Staff-facing: quick actions (freeze, cancel, update payment)
- Bulk operations polish
- Member notes / activity timeline
- Emergency contact management

## Week 9: Reporting + Analytics
- Revenue reports (daily, weekly, monthly)
- Member growth / churn metrics
- Retention analysis
- Export to CSV
- Dashboard KPIs from real aggregations

## Week 10: Polish + Edge Cases
- Error boundaries throughout the app
- Offline / poor connection handling
- Loading skeletons for all data-dependent views
- Mobile responsive pass
- Accessibility audit (ARIA, keyboard nav, color contrast)

## Week 11: Testing + Security
- Integration tests for critical flows (auth, payments, access)
- RLS policy tests (ensure tenant isolation)
- Stripe webhook signature verification
- Rate limiting on edge functions
- Security review: OWASP top 10 check

## Week 12: Launch Prep
- Production Supabase project setup
- Environment configs (staging, production)
- Monitoring + alerting (Supabase dashboard, Stripe webhooks)
- User acceptance testing with gym owner
- Documentation for gym staff
- Go-live checklist

---

## Key Decisions
| Decision | Choice |
|----------|--------|
| Auth scope | Staff only — gym members never log in |
| Multi-gym | Schema supports it from day one |
| Member IDs | Human-readable `MEM-XXX` (text PK) |
| Billing gap | Mock defaults until Stripe wired (Week 3) |
| Scanner | RS-232 serial, Code 128 barcodes, bridge on gym PC |
| Plans | Monthly ($49), Annual ($499), Day Pass ($15), 10-Class Pack ($120) |
| Grace period | Configurable, default 30 days |
| Stripe mode | Express Connect |

## Action Items
- [ ] **Apply for Stripe Platform account** — approval takes days/weeks, blocks Week 3
- [ ] Discuss grace period default with gym owner
- [ ] Get ABC CSV sample for migration tool design
- [ ] Confirm scanner hardware model for RS-232 bridge
