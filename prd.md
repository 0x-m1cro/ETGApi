# RateHawk API Integration - Project Brief

## Executive Summary

This document outlines the requirements for building a production-ready Node.js API server that integrates with the Emerging Travel Group (ETG) API v3, also known as RateHawk API. The server will provide a comprehensive hotel booking solution enabling hotel search, rate management, booking processing, and post-booking operations.

## Project Overview

**API Provider:** Emerging Travel Group (RateHawk)  
**API Version:** v3  
**Base URL:** `https://api.worldota.net`  
**Environment:** Production-ready with Sandbox support  
**Target Platform:** Node.js API Server

## API Access & Authentication

### Authentication Method
- **Type:** HTTP Basic Authentication
- **Structure:** `<KEY_ID>:<API_KEY>`
- **Key Components:**
  - KEY_ID: Used as HTTP Basic Authentication username
  - API_KEY: Used as HTTP Basic Authentication password (must be kept secret)

### Environment Types
1. **Sandbox (Test):** For testing with test hotels only (`test_hotel_do_not_book`, `test_hotel`)
2. **Production:** For live hotel bookings with real inventory

### Security Requirements
- IP whitelisting required on both sides (client → ETG, ETG → client)
- API keys must be securely stored and never exposed
- Rate limiting applies to all endpoints (limits specified in response headers)
- User-Agent header must be included in all requests

## Integration Stages

### 1. Pre-Integration Stage
- Complete questionnaire from ETG manager
- Obtain API credentials (sandbox and production)
- Configure IP whitelisting

### 2. Integration Stage (Development)
- Review integration guidelines and best practices
- Implement all required endpoints
- Build according to recommended workflow
- Test thoroughly in sandbox environment

### 3. Certification Stage
- Complete Pre-certification Checklist
- Provide API documentation for review
- Submit booking logs (JSON format preferred)
- Address any feedback from ETG API Launch team
- Certification timeline: 14-30 days

## Core Features & Workflows

### 1. Static Data Management (Weekly/Daily Updates)

#### Required Endpoints:
- **Hotel Dump:** `/api/b2b/v3/hotel/info/dump/` (Weekly)
- **Hotel Incremental Dump:** `/api/b2b/v3/hotel/info/incremental_dump/` (Daily)
- **Regions Dump:** `/api/b2b/v3/hotel/regions/dump/` (Weekly)

#### Recommended Endpoints:
- **Hotel Content:** `/api/b2b/v3/hotel/info/` (For new hotels not in dump)
- **Hotel Reviews Dump:** Available for review data

#### Data Management Requirements:
- Download and store dumps locally
- Update daily using incremental dump (check `last_update` parameter)
- Process large files line-by-line (memory efficiency)
- Parse and display `metapolicy_struct` and `metapolicy_extra_info` (critical hotel rules)
- Implement hotel mapping logic (match ETG hotels to internal system)
- Use `hid` (not `id`) as the hotel identifier

### 2. Search Workflow (3-Step Process)

#### Step 1: Initial Search (One Method Required)
Choose ONE of these endpoints:

1. **Search by Region:** `/api/b2b/v3/search/serp/region/`
   - Returns all hotels in specified region
   
2. **Search by Hotel IDs:** `/api/b2b/v3/search/serp/hotels/`
   - Returns specific hotels (max 300 per request)
   - Recommended: Send 300 hotels per request
   
3. **Search by Geo:** `/api/b2b/v3/search/serp/geo/`
   - Returns hotels within radius of lat/long

**Important Notes:**
- Display only 1-2 lowest rates per hotel in this step
- Do not allow rate selection at this stage
- Rates may differ from Step 2 (Hotelpage)
- Support up to 30-night stays
- Support up to 6 adults and 4 children per room (children: ≤17 years)
- Children ages must be in brackets: `[7, 15]`
- Check-in date ≤ 730 days from today
- Include `residency` (passport country) parameter
- Recommended timeout: 30 seconds

#### Step 2: Hotel Details (Required)
**Retrieve Hotelpage:** `/api/b2b/v3/search/hp/`

- Call ONLY when user selects specific hotel
- Display all available rates for selected hotel
- Cache duration: Up to 1 hour (not strict)
- Parse and display `room_name`, meal types, cancellation policies
- Display non-included taxes separately (`included_by_supplier: false`)
- Support dynamic timeouts (send `timeout` parameter)

#### Step 3: Rate Verification (Required)
**Prebook Rate:** `/api/b2b/v3/hotel/prebook`

- **Mandatory implementation** - increases booking success ratio
- Verifies rate availability before booking
- Can find alternative rates if original unavailable
- Use `price_increase_percent` (0-100%) to allow price flexibility
- Must notify user if price changes
- Timeout: 60 seconds recommended (30s minimum)
- Book hash transformation: `h-...` → `p-...`
- Must be excluded from booking flow (separate step)

**Hash Flow:**
- Hotelpage provides: `book_hash: "h-..."`
- Prebook uses: `book_hash: "h-..."` as input
- Prebook returns: `book_hash: "p-..."` for booking

### 3. Booking Workflow (All Required)

#### Step 1: Create Booking (Required)
**Endpoint:** `/api/b2b/v3/hotel/order/booking/form/`

- Creates booking order on ETG side
- Links ETG order with partner order ID
- Returns `partner_order_id` for tracking

**Error Handling:**
- `ok` status → Proceed to next step
- `timeout`, `unknown`, 5xx → Retry up to 10 times
- `double_booking_form` → Change `partner_order_id` and retry
- `contract_mismatch`, `rate_not_found`, etc. → Stop, show failure

#### Step 2: Start Booking (Required)
**Endpoint:** `/api/b2b/v3/hotel/order/booking/finish/`

- Initiates booking process with suppliers
- Status will be `processing` initially
- Returns `ok` status → Proceed to polling

**Error Handling:**
- `ok` status → Proceed to status checking
- `timeout`, `unknown`, `booking_form_expired` → Retry with new prebook

#### Step 3: Get Final Status (ONE Required)

**Option A: Check Booking Status (Polling)**  
**Endpoint:** `/api/b2b/v3/hotel/order/booking/finish/status/`

- Poll every second until final status
- Implement retry logic according to best practices
- Continue polling within booking timeout window

**Status Types:**
- `ok` → Booking successful (confirmed)
- `processing` → Continue polling
- `timeout`, `unknown`, 5xx → Continue polling (not failures)
- `3ds`, `block`, `book_limit`, `booking_finish_did_not_succeed`, `provider`, `soldout` → Final failures

**Option B: Webhook (Alternative)**  
**Endpoint:** Partner-provided callback URL

- ETG sends final booking status to your endpoint
- Must respond with 200 OK
- Statuses: `confirmed` or `failed`
- More efficient than polling
- Contact ETG to enable and provide callback URL

**Both options can be implemented for redundancy**

### 4. Payment Types

The API supports different payment models:

1. **Deposit (B2B):** Partner pays from deposit, charges end-user
2. **Hotel Payment:** Guest pays at hotel (may require credit card token)
3. **Now Payment (Affiliate):** ETG charges card during booking (currently unavailable in sandbox)

For hotel payment requiring cards:
- Integrate `/api/b2b/v3/hotel/order/booking/cc/` (Create credit card token)
- Check `is_need_credit_card_data` and `is_need_cvc` in rate response

### 5. Post-Booking Operations

#### Retrieve Bookings (Recommended)
**Endpoint:** `/api/b2b/v3/hotel/order/info/`

- Get details about successful bookings
- Do NOT use for checking final booking status
- Do NOT call immediately after booking completion
- Wait for data synchronization before calling
- Rate details never change after booking

#### Cancel Booking (Recommended)
**Endpoint:** `/api/b2b/v3/hotel/order/cancel/`

- Cancels confirmed bookings
- If `timeout` error received, retry once
- Parse cancellation policies before allowing cancel

## Critical Implementation Requirements

### 1. Pricing & Commission
**For B2B (Net Prices):**
- Use `amount` (reconciliation currency) or `show_amount` (requested currency)
- Partner calculates own commission/markup
- Exclude non-included taxes from final price

**For Affiliate (Gross Prices):**
- Use `amount` or `show_amount`
- ETG calculates and includes commission
- Exclude non-included taxes from final price

### 2. Cancellation Policies
- Parse from `cancellation_penalties.policies` array
- Three layers: free cancellation → partial penalty → full penalty
- `free_cancellation_before: null` means no free cancellation
- All times in UTC+0
- Display clearly to end-users

### 3. Taxes and Fees
- Separate included vs non-included taxes
- Parse `tax_data.taxes` array
- Check `included_by_supplier` field
- Display non-included taxes separately (not in final price)

### 4. Multi-room Bookings
- Support up to 9 rooms per booking
- Same room type only (no mixed types)
- Specify in `guests` parameter during search

Example:
```json
"guests": [
  {"adults": 2, "children": []},
  {"adults": 2, "children": [7]}
]
```

### 5. Children Logic
- Children: Ages ≤17 years
- Specify ages in brackets: `[7, 15]`
- Include in search requests for accurate pricing

### 6. Residency/Citizenship
- Required parameter in all search requests
- Refers to passport country (not current location)
- Prices may vary based on residency
- Same citizenship for all guests in one request

### 7. Room Data Matching
- Use `rg_ext` fields to match rooms
- Match ALL `rg_ext` fields between search and static data
- Required for room images and amenities

### 8. Meal Types
- Parse `meal_data.value` from rates
- Match with static meal data from dump
- Do not improve meal types (match exactly or worsen)

### 9. Booking Status Mapping
**Required Statuses:**
- Success: `ok` (Check booking) / `confirmed` (Webhook)
- Failed: Multiple error codes (see best practices)
- In Progress: `processing`, `timeout`, `unknown`, 5xx

**Optional Statuses:**
- Cancelled (post-booking only)
- No-show (post-booking only)

### 10. Confirmation Emails
**B2B API:**
```json
"user": {
  "email": "corporate@yourcompany.com"  // Fixed corporate email
}
```

**Affiliate API:**
```json
"user": {
  "email": "customer@example.com"  // End-user email
}
```

### 11. Timeout Management
- Search methods: 30s recommended (configurable)
- Prebook: 60s recommended, 30s minimum
- Booking cutoff: Configured with ETG during certification
- No dynamic booking timeouts supported

### 12. Caching Strategy
- Static dumps: Weekly/daily updates required
- First search step (SERP): Can cache if showing approximate prices
- Hotelpage: Cache up to 1 hour (not strict)
- Prebook: **Do NOT cache**
- If using `match_hash`: **Do NOT cache**

## Technical Specifications

### Required Headers
```
Authorization: Basic <base64(KEY_ID:API_KEY)>
Content-Type: application/json
User-Agent: YourApp/1.0.0
```

### Response Format
- All responses in JSON
- Error codes documented per endpoint
- Rate limiting info in response headers

### Error Handling Strategy
1. Implement retry logic per endpoint guidelines
2. Distinguish between retryable and final errors
3. Log all API interactions for certification
4. Handle 5xx errors as temporary (retry)
5. Handle specific error codes as documented

### Data Validation
- Validate all input parameters before API calls
- Check date ranges (max 30 nights, max 730 days ahead)
- Validate guest counts (max 6 adults, 4 children per room)
- Validate hotel count (max 300 per search request)

## Testing Requirements

### Sandbox Testing
- Use only test hotels: `test_hotel_do_not_book`, `test_hotel`
- Test all workflows end-to-end
- Test error scenarios
- Verify proper status handling

### Required Test Scenarios
1. Full booking flow (search → hotelpage → prebook → booking)
2. Price change handling during prebook
3. Rate unavailability handling
4. Multi-room bookings
5. Children in bookings
6. Various cancellation policies
7. Included vs non-included taxes
8. Payment type variations
9. Webhook handling (if implemented)
10. Booking status polling with all possible statuses

## Deliverables for Certification

1. **API Documentation:** Complete documentation of your API endpoints
2. **Booking Logs:** JSON format logs showing:
   - Your API requests/responses
   - ETG API requests/responses
   - Complete booking flow
3. **Pre-certification Checklist:** Completed form
4. **Workflow Diagram:** Showing your system's integration with ETG endpoints
5. **Test Results:** Evidence of successful sandbox testing

## Support & Contact

- **Technical Questions:** [email protected]
- **API Support:** [email protected]
- **Account Management:** Contact your dedicated Account Manager
- **Certification:** API Launch Team

## Timeline Estimate

- **Development:** 4-8 weeks (depending on complexity)
- **Internal Testing:** 1-2 weeks
- **Certification:** 2-4 weeks (14-30 days typical)
- **Production Launch:** After certification approval

## Success Criteria

1. All required endpoints implemented correctly
2. Error handling follows best practices exactly
3. Booking success rate optimized (prebook implemented)
4. Status handling matches ETG requirements
5. Data display meets requirements (taxes, policies, etc.)
6. Security requirements met (IP whitelisting, secure credentials)
7. Certification completed successfully
8. Production deployment approved by ETG

## Notes & Recommendations

- Do NOT match rates between SERP and Hotelpage (unless necessary)
- If matching required, contact ETG for guidance
- Always implement Prebook step (increases success by 15-20%)
- Keep API keys secure (use environment variables)
- Monitor rate limiting headers
- Update static data daily (incremental dump)
- Test thoroughly before certification
- Prepare detailed logs for certification review
- Consider implementing both polling and webhooks for resilience

---

**Document Version:** 1.0  
**Date:** November 2025  
**Based on:** ETG API v3 Integration Guidelines & Best Practices