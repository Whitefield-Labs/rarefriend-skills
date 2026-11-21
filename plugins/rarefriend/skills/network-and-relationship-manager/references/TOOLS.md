# Rarefriend MCP — Tool Parameter Reference

## Contacts

### search_contacts

```
query?        string   — search terms (name, email, company, role)
tag?          string   — filter by a single tag (exact match)
limit?        number   — results per page (default 20, max 100)
offset?       number   — pagination offset
searchMode?   enum     — 'all' | 'name' | 'company' | 'role' | 'email' | 'exact'
```

Response includes `hasMore`, `totalCount`, `contacts[]`.

### get_contact

```
contactId     string   — required
```

### create_contact

```
displayName   string   — required
firstName?    string
lastName?     string
emails?       string[]
phones?       string[] — E.164 format preferred
company?      string
currentRole?  string
location?     string
bio?          string
```

### update_contact

```
contactId     string   — required
...           same optional fields as create_contact
```

### delete_contact

```
contactId     string   — required (soft delete, recoverable)
```

---

## Notes

### create_note / update_note

```
contactId     string   — required (create only)
noteId        string   — required (update/delete/get/pin only)
body          string   — markdown supported
isPinned?     boolean
```

### search_notes

```
query         string   — full-text search across all contacts
limit?        number   — default 20
```

### get_recent_notes

```
limit?        number   — default 10
```

---

## Tags

### add_tag / remove_tag

```
contactId     string   — required
tag           string   — required, normalised to lowercase
```

### rename_tag

```
oldTag        string   — required
newTag        string   — required
```

Renames the tag across all contacts in the workspace.

---

## Google Calendar

### create_google_calendar_event

```
title         string   — required
startTime     string   — ISO 8601 with timezone, e.g. "2026-06-10T14:00:00+05:30"
endTime       string   — ISO 8601 with timezone
description?  string
attendees?    string[] — email addresses
location?     string
transparency? enum     — 'opaque' (busy) | 'transparent' (free)
```

### find_available_google_time

```
startDate          string   — required, ISO 8601 with the user's UTC offset, e.g. 2026-11-20T09:00:00+05:30
endDate            string   — required, ISO 8601 with the user's UTC offset
duration           number   — required, minutes (15–480)
workingHoursOnly?  boolean  — weekdays 09:00-17:00 only; leave unset for weekend or evening searches
# checks the connected user's own calendar only — not other attendees'
```

### search_google_calendar_events / search_microsoft_calendar_events

```
query         string   — keyword search
timeMin?      string   — ISO 8601
timeMax?      string   — ISO 8601
```

### reschedule_google_event / reschedule_microsoft_event

```
eventId       string   — required
newStartTime  string   — ISO 8601
newEndTime    string   — ISO 8601
message?      string   — Microsoft: prepended to the event body as [RESCHEDULED: ...]. Google: accepted but not delivered
```

---

## Microsoft Outlook

### search_microsoft_contacts

```
query         string   — required
limit?        number   — default 20, max 100
```

### get_microsoft_contact

```
contactId     string   — required
```

### create_microsoft_calendar_event

```
title         string   — required
startTime     string   — ISO 8601 with timezone
endTime       string   — ISO 8601 with timezone
description?  string
attendees?    string[] — email addresses
location?     string
```

### find_available_microsoft_time

```
startDate           string   — required, ISO 8601 with the user's UTC offset, e.g. 2026-11-20T09:00:00+05:30
endDate             string   — required, ISO 8601 with the user's UTC offset
duration            number   — required, minutes (15–480)
workingHoursOnly?   boolean  — weekdays 09:00-17:00 only; leave unset for weekend or evening searches
# checks the connected user's own calendar only — not other attendees'
```

### get_upcoming_microsoft_events

```
days?         number   — look-ahead window in days (default 7, max 365)
maxResults?   number   — default 20, max 100
```

### cancel_microsoft_event

```
eventId       string   — required
```

### list_microsoft_emails

```
limit?        number   — default 10, max 50
startDate?    string   — ISO 8601 — only emails after this date
endDate?      string   — ISO 8601 — only emails before this date
folderId?     string   — specific folder (default: inbox)
```

### search_microsoft_emails

```
query         string   — required; matches subject, body snippet, sender name, or sender email
limit?        number   — default 10, max 50
```

---

## Bulk Import

### bulk_create_contacts

```
contacts      array    — required, 1–50 items
  Each item:
    displayName   string   — required
    firstName?    string
    lastName?     string
    emails?       string[]
    phones?       string[]
    company?      string
    role?         string
    location?     string
    bio?          string
```

Response: `{ summary: { requested, created, failed }, results[], quota? }`
A result may include `droppedPhones` and `warning` when invalid phone numbers were ignored — phones must be in international format (e.g. `+14155552671`).
On `quota_exceeded`: advise user to upgrade at rarefriend.com.

---

## Integration Management

### connect_integration

```
integration   enum — 'gmail' | 'google_contacts' | 'google_calendar'
                   | 'microsoft_contacts' | 'microsoft_calendar' | 'microsoft_email'
```

Response: `{ connectUrl, expiresInMinutes: 15, instructions }`
Present `connectUrl` as a clickable link. Never ask the user for OAuth credentials.

### get_integration_sync_status

```
integration   string — same enum as connect_integration
```

Response includes last sync time, status, and item count.
