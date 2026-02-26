# Zen Assurance API
Base URL: `gateway.api.indirect.zen.co.uk/assurance`
OAuth scope: primarily `indirect-diagnostics`

## Endpoints by Category

### Connection Status (`indirect-broadbandconnection`)
- GET `/api/connectionstatus/{zenReference}` — live broadband connection details
- POST `/api/connectionstatuses` — bulk status for multiple services
- GET `/api/drops-over-time/{zenReference}` — connection drops between two dates

### Diagnostics — Fibre (`indirect-diagnostics`)
- POST `/api/fibre/services/{zenReference}/{testType}` — run fibre service test
- GET `/api/fibre/services/{zenReference}/latest` — last test result
- FTTP, SOGEA, Altnet variants available

### Diagnostics — Copper (`indirect-diagnostics`)
- GET `/api/copper/services/check-available-test-types/{zenReference}`
- POST `/api/copper/services/{zenReference}/{testType}` — xDSL, line test, TAM, KBD
- GET `/api/copper/services/{zenReference}/xdsltest/latest`

### Faults (`indirect-faults`)
- POST `/api/fault/synchronisation/permanent` — raise permanent sync fault
- POST `/api/fault/synchronisation/intermittent`
- POST `/api/fault/authentication/permanent`
- POST `/api/fault/performance/permanent`
- GET `/api/fault/{zenReference}` — get fault details
- GET `/api/faults/open` — all open faults
- GET `/api/faults/recentlyclosed`
- POST `/api/fault/{faultReference}/update` — add update to fault

### Usage (`indirect-diagnostics`)
- GET `/api/usage/{zenReference}` — hourly usage for date range
- GET `/api/dailyusage/{zenReference}` — daily usage
- GET `/api/monthlyusage/current/{zenReference}` — current month
- GET `/api/monthlyusage/historic/{zenReference}` — historic months
- GET `/api/monthlyusage/report` — usage report for a month

### Outages & Planned Work (`indirect-diagnostics`)
- GET `/api/major-service-outages` — active outages
- GET `/api/major-service-outages/zenreference/{zenReference}` — outage for specific service
- GET `/api/planned-engineering-work` — upcoming 1 year
- GET `/api/planned-engineering-work/past` — last 7 days

### Radius / Authentication (`indirect-diagnostics`, `indirect-service`)
- GET `/api/authentication-attempts/{zenReference}` — last 10 auth attempts
- GET `/api/radius-proxy-logs/{zenReference}` — last 10 radius proxy logs
- POST `/api/radiusconnections/{zenReference}/suspend`
- POST `/api/radiusconnections/{zenReference}/resume`
