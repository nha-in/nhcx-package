# Session token

Every call carries a bearer token. The token does not come from NHCX. It comes from the ABDM gateway, with the client ID and secret you received when you registered on the ABDM sandbox. The handbook calls them `ABDM_CLIENT_ID` and `ABDM_CLIENT_SECRET`.

## Getting one

<!-- build-docs:api 01-session/session-token.bru -->
```bash
curl --location --request POST 'https://dev.abdm.gov.in/api/hiecm/gateway/v3/sessions' \
  --header 'Content-Type: application/json' \
  --header 'REQUEST-ID: <uuid>' \
  --header 'TIMESTAMP: <iso timestamp>' \
  --header 'X-CM-ID: sbx' \
  --data-raw '{
    "clientId": "<client id>",
    "clientSecret": "<client secret>",
    "grantType": "client_credentials"
  }'
```
<!-- build-docs:end -->

Three headers matter here, and none of them is optional.

- `REQUEST-ID` is a fresh UUID that you generate for every call. Sending the same one twice is the mistake to avoid; generate it, do not copy it from an example.
- `TIMESTAMP` is the current time in UTC, ISO 8601 with milliseconds and a trailing `Z`, as in `2026-09-04T06:15:51.975Z`. A clock that has drifted will be refused, so take the time from the system rather than constructing it by hand. How to produce it in each language is at the end of this chapter.
- `X-CM-ID` names the environment. It is `sbx` on the sandbox. The mirror and the adapter both use lowercase.

`grantType` is `client_credentials`. The older form of this call omitted it, which is why an otherwise correct request copied from an old sample can be rejected.

A second token call is published: `POST /get/session` on the participant service, form-encoded (`client_id`, `client_secret`, `grant_type=client_credentials`), answering `access_token` and `expires_in` `1200`. It takes the same credentials, and the sandbox exit checklists name it as the auth-token call. Keep the address, body encoding and the two response field names in configuration, so either call can be used without a code change.

The response:

```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIs...",
  "expiresIn": 1200,
  "refreshTokenIn": 300,
  "refreshToken": "eyJhbGciOiJSUzI1NiIs...",
  "tokenType": "bearer"
}
```

## Using it

On every NHCX call, the token goes in a header called `bearer_auth`, with the word `Bearer` and a space in front. NHCX reads `bearer_auth`, not `Authorization`.

```
bearer_auth: Bearer eyJhbGciOiJSUzI1NiIs...
```

Leaving out the `Bearer` prefix is the portal's own example of how to get a `401`.

## Keeping it fresh

The token lasts 1200 seconds (20 minutes) from the moment it arrives. Build it like this:

- Keep the token and the time you got it.
- Before each call, if the token is more than about 18 minutes old, get a new one first.
- If any call answers `401`, get a new token and retry that call once. Do not retry with the same token; it will fail the same way.
- Never write the token or the secret to a log.

One token serves every call: the participant service, the use-case endpoints, and the status check.

## What can go wrong

| Symptom | Cause |
| :---- | :---- |
| `401` on the sessions call itself | Wrong client ID or secret |
| An error on the sessions call naming a header | `REQUEST-ID` reused or absent, `TIMESTAMP` stale or in the wrong format, or `X-CM-ID` missing |
| An error on the sessions call naming the body | `grantType` omitted, which the v3 address requires |
| `401 Sender is not authorized to execute the operation` on an NHCX call | Token expired |
| `401` immediately after getting a fresh token | `Bearer` prefix missing |

## Generating the timestamp

Two ISO 8601 shapes appear on NHCX, and they are not interchangeable.

- The ABDM gateway headers, `TIMESTAMP` on the sessions call, take UTC with milliseconds and a trailing `Z`: `2026-09-04T06:15:51.975Z`.
- The exchange header `x-hcx-timestamp` and `Bundle.timestamp` take Indian Standard Time as an offset: `2026-09-04T11:46:34+05:30`. The two examples are the same instant. Milliseconds are optional there: most of the package's sample bundles carry them in `Bundle.timestamp` (`2026-02-26T18:23:17.269+05:30`), and the snippets below leave them out. NHA does not fix this format in one place: the handbook says Indian time, the FAQ says UTC with `Z`, and the reference adapter writes the offset without a colon, `+0530`, which the sandbox accepts. Building and Sending a JWE and JWE, Status and Errors in the Overview have the detail; the samples' `+05:30` is the safe default.

Take the time from the system clock, keep the clock synchronised with NTP, and let a date library do the formatting. Each snippet below produces `utc` for the gateway and `ist` for the exchange.

### JavaScript and TypeScript

```js
const now = new Date();
const utc = now.toISOString();                                    // 2026-09-04T06:15:51.975Z
const ist = new Date(now.getTime() + 330 * 60 * 1000)
  .toISOString().slice(0, 19) + "+05:30";                         // 2026-09-04T11:46:34+05:30
```

### Python

```python
from datetime import datetime, timezone, timedelta

utc = datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")
ist = datetime.now(timezone(timedelta(hours=5, minutes=30))).isoformat(timespec="seconds")
```

### Java and Kotlin

```java
import java.time.*;
import java.time.format.DateTimeFormatter;

String utc = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSX")
    .withZone(ZoneOffset.UTC).format(Instant.now());
String ist = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssXXX")
    .format(OffsetDateTime.now(ZoneOffset.ofHoursMinutes(5, 30)));
```

### C# and ASP.NET

```csharp
var now = DateTimeOffset.UtcNow;
string utc = now.ToString("yyyy-MM-dd'T'HH:mm:ss.fff'Z'");
string ist = now.ToOffset(TimeSpan.FromMinutes(330)).ToString("yyyy-MM-dd'T'HH:mm:sszzz");
```

### PHP

```php
$utc = (new DateTime('now', new DateTimeZone('UTC')))->format('Y-m-d\TH:i:s.v\Z');
$ist = (new DateTime('now', new DateTimeZone('Asia/Kolkata')))->format('Y-m-d\TH:i:sP');
```

### Go

```go
now := time.Now()
utc := now.UTC().Format("2006-01-02T15:04:05.000Z")
ist := now.In(time.FixedZone("IST", 330*60)).Format("2006-01-02T15:04:05-07:00")
```

### C++

C++20 `<chrono>` and `<format>`:

```cpp
#include <chrono>
#include <format>
using namespace std::chrono;

auto now = floor<milliseconds>(system_clock::now());
std::string utc = std::format("{:%FT%T}Z", now);                       // 2026-09-04T06:15:51.975Z
auto ist = floor<seconds>(now) + hours(5) + minutes(30);
std::string istStr = std::format("{:%FT%T}+05:30", ist);               // 2026-09-04T11:46:34+05:30
```

Before C++20, `gmtime` with `strftime("%FT%T")` gives the seconds; append the milliseconds from `gettimeofday` and the `Z` by hand.

### Ruby

```ruby
utc = Time.now.utc.strftime('%Y-%m-%dT%H:%M:%S.%LZ')
ist = Time.now.getlocal('+05:30').strftime('%Y-%m-%dT%H:%M:%S%:z')
```

### Swift

```swift
let f = ISO8601DateFormatter()
f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
let utc = f.string(from: Date())
f.formatOptions = [.withInternetDateTime]
f.timeZone = TimeZone(secondsFromGMT: 19800)
let ist = f.string(from: Date())
```

### Shell

GNU `date`, as on Linux:

```bash
utc=$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)
ist=$(TZ=Asia/Kolkata date +%Y-%m-%dT%H:%M:%S%:z)
```

macOS `date` has no `%N`; use `gdate` from coreutils, or generate the value in the application rather than the shell.

Whichever language, the check is the same: the gateway value ends in `Z` and has three digits after the seconds; the exchange value ends in an Indian offset, `+05:30` as the samples write it.
