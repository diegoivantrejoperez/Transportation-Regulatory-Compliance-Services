# TRC Compliance App - Product Requirements Document

## Project Overview
**Product:** Transportation Regulatory Compliance (TRC) Web App (mobile-first)
**Version:** 1.0 MVP
**Date:** March 2026
**Contact:** questions@transportationregulatorycompliance.com | 877-668-2114

## Problem Statement
Build a "BadAss" compliance management app for trucking companies with seamless USDOT lookup, MCS-150 status checking, payment processing ($299/$499), and compliance monitoring. Core flow: No-auth USDOT search → Status check (RED/YELLOW/GREEN) → Payment or Free monitoring signup → Verification + signature → Success → Dashboard.

## Architecture
- **Frontend:** React 18, React Router v6, Tailwind CSS, Axios, react-signature-canvas
- **Backend:** FastAPI (Python), Motor (async MongoDB driver)
- **Database:** MongoDB
- **Payments:** Stripe Checkout (emergentintegrations library)
- **FMCSA Data:** data.transportation.gov Socrata API (az4n-8mr2)
- **Auth:** JWT (python-jose), bcrypt passwords

## Brand Identity
- Colors: Midnight Navy #0A2342, Regulatory Gold #DAA520, Light Gold #F9E498
- Status: RED #DC2626, YELLOW #FBBF24, GREEN #10B981
- Fonts: Montserrat (headers), Roboto (body), Playfair Display (tagline)
- Tagline: "We Worry, So You Don't Have To."
- Phone: 877-668-2114

## Implemented Features (v1.0)

### Backend APIs (all working - 18/18 tests pass)
- `GET /api/usdot/{usdot_number}` - FMCSA lookup with 24h cache
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - JWT authentication
- `POST /api/auth/magic-link/verify` - Magic link activation
- `GET /api/auth/me` - Get current user
- `POST /api/payments/create-checkout` - Stripe checkout session
- `GET /api/payments/status/{session_id}` - Payment status polling
- `POST /api/webhook/stripe` - Stripe webhook
- `POST /api/filings/submit` - Submit MCS-150 filing with signature
- `POST /api/monitoring/subscribe` - Free 30-day monitoring signup
- `GET /api/dashboard` - User dashboard data
- `GET /api/filings/history` - Filing history
- `GET /api/notifications` - Notifications
- `PATCH /api/notifications/{id}/read` - Mark notification read

### Frontend Pages (all working)
- **HomePage** - USDOT search, TRC branding, no-auth
- **StatusPage** - Compliance status (RED/YELLOW/GREEN), pricing cards, shield badge
- **PaymentSuccessPage** - Stripe redirect landing, payment status polling
- **VerificationPage** - Post-payment form + digital signature canvas
- **FilingSuccessPage** - Success screen with confirmation number
- **DashboardPage** - Compliance gauge, stats grid, notifications, bottom nav
- **LoginPage** - Sign in / Create account with tabs
- **MonitoringSignupPage** - Free monitoring signup

### Database Collections
- `users` - User accounts with bcrypt passwords
- `dot_records` - USDOT compliance records (user-linked)
- `dot_cache` - 24-hour FMCSA data cache
- `payment_transactions` - Stripe checkout sessions
- `filings` - MCS-150 filing records with signature
- `notifications` - User notifications

## Pricing Tiers
- 2-Year Standard: $299.00
- 4-Year Premium: $499.00

## User Personas
1. Owner-operators (independent truckers)
2. Fleet managers (managing multiple USDOT)
3. Trucking company admins
4. New entrants to trucking

## Core User Flow
1. Enter USDOT (no auth required)
2. See status (RED=expired, YELLOW=30days, GREEN=compliant)
3. RED/YELLOW → Select plan → Stripe checkout → verification → signature → success
4. YELLOW/GREEN → Free monitoring signup → dashboard
5. Post-payment → auto-login → dashboard

## What's Working
- Live FMCSA data from data.transportation.gov API
- TIN/SSN AES-256 encrypted before MongoDB storage
- JWT magic link token generation after filing
- Stripe checkout session creation (redirect flow)
- Mobile-first responsive design (max-width 480px)
- All data-testid attributes for testing

## Priority Backlog

### P0 - Critical (needed before production)
- [ ] Add Stripe webhook signature verification
- [ ] Add JWT secret key validation at startup (no fallback)
- [ ] Add rate limiting on USDOT lookup endpoint
- [ ] Production Stripe keys configuration

### P1 - High (Phase 2)
- [ ] Email notifications (Resend/SendGrid) for 30-day warnings
- [ ] Magic link email delivery (currently token returned in API response)
- [ ] Multi-USDOT management in dashboard
- [ ] Push notifications (Expo when mobile)

### P2 - Medium (Phase 3)
- [ ] BOC-3 processing service
- [ ] UCR registration
- [ ] Subscription tiers (Bronze/Silver/Gold)
- [ ] Compliance calendar
- [ ] Document upload/storage (S3)
- [ ] PDF filing generation

### P3 - Low (Phase 4)
- [ ] In-app chat/support
- [ ] Analytics dashboard (Mixpanel)
- [ ] Referral program
- [ ] iOS/Android app builds (React Native wrap)

## Next Tasks
1. Configure production Stripe keys
2. Add email service (Resend) for magic links and 30-day warnings
3. Test RED status USDOT (expired carrier) end-to-end payment flow
4. App store assets preparation
