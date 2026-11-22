# API documentation

Base URL: `http://localhost:5000/api/v1`

Successful responses:

```json
{
  "success": true,
  "message": "Property evaluated successfully",
  "data": {},
  "meta": { "page": 1, "limit": 20, "total": 1 }
}
```

`meta` is present on list endpoints. Errors:

```json
{ "success": false, "message": "Validation failed", "data": null, "details": {} }
```

`details` is included for validation failures.

Send `Authorization: Bearer <supabase access token>` on every route except `GET /health`. The API verifies the token with Supabase Auth, checks the `aud` claim against `JWT_AUDIENCE`, and loads `profiles`. Inactive accounts receive 403. The user id and role always come from that verified profile.

## Health

`GET /health` — no authentication.

## Profile

`GET /users/me`

`PATCH /users/me`

```json
{ "full_name": "Ayesha Khan", "phone": "+923001234567" }
```

Password changes stay on the Supabase client via `auth.updateUser`. This API does not accept a password.

## Evaluations

`POST /evaluations` — 201. Body:

| Field | Required | Values |
| --- | --- | --- |
| property_title | no | string, max 120 |
| property_type | yes | `house`, `apartment`, `residential_plot`, `commercial_property` |
| country, city, location | yes | strings |
| property_size | yes | positive number |
| area_unit | yes | `marla`, `kanal`, `square_feet`, `square_yards` |
| covered_area | no | positive number |
| bedrooms, bathrooms | no | integers 0–50 |
| property_condition | yes | `new`, `excellent`, `good`, `average`, `needs_renovation` |
| asking_price | yes | positive number |
| currency | yes | 3-letter code, stored uppercase |

A second pending or processing evaluation with the same normalized inputs for the same user returns 409.

`GET /evaluations?page=1&limit=20` — only the caller's rows.

`GET /evaluations/:id` — evaluation, result, asking-price difference, and disclaimers. Another user's id returns 404.

`DELETE /evaluations/:id` — caller's row only. The result row is removed by foreign key cascade.

`POST /evaluations/:id/analyze` — rate limited to 5 requests per 10 minutes per user.

The handler loads verified comparables, calls the configured OpenRouter model, validates the JSON, and saves a result. Completed evaluations return the stored result. A failure sets status `failed` and does not store invented prices. Timeouts return 504. Invalid model output returns 502.

`GET /evaluations/:id/result` — 404 until a result exists.

### Result fields

`estimated_value`, `minimum_value`, and `maximum_value` are null when `confidence_level` is `insufficient_data`. `price_status` is `underpriced`, `fairly_priced`, `overpriced`, or `unknown`. `investment_recommendation` is `good_investment`, `consider_carefully`, `not_recommended`, or `insufficient_data`. `price_difference` is asking price minus estimated value, or null.

`market_data_available` is true only when at least one verified comparable in the same country, city, property type, area unit, and currency was supplied to the model.

## Admin

Every route below requires an active admin profile. Non-admins receive 403.

`GET /admin/dashboard` — counts, five recent users, five recent evaluations.

`GET /admin/analytics?days=30` — daily evaluations, daily registrations, counts by property type, and the top cities. `days` is 7–365. Dates are UTC.

`GET /admin/users?search=&page=1&limit=20` — name or email search, plus `evaluation_count`. No password or token fields.

`GET /admin/users/:id` — profile and up to 10 recent evaluations.

`PATCH /admin/users/:id/status`

```json
{ "status": "inactive" }
```

`active` removes the auth ban. An admin cannot change their own status.

`GET /admin/evaluations?search=&property_type=&status=&page=1&limit=20`

`search` matches city, area, or country. Failed rows include `error_message`.

`GET /admin/evaluations/:id` — submitted property, AI result, and the owner's name and email.
