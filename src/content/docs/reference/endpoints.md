---
title: Endpoints
---

In Restura, an **endpoint** is a group of related routes sharing the same base URL (e.g., `/api/v1/users`). Each endpoint contains one or more **routes**—individual API paths that handle requests for specific operations.

Routes come in two flavors:

-   **Standard routes** automatically generate SQL queries based on your schema configuration
-   **Custom routes** delegate to your own TypeScript handler code for complex business logic

---

## Route Types

Routes are categorized by the shape of data they return:

| Type           | Description                                   | SQL Generated |
| -------------- | --------------------------------------------- | ------------- |
| `ONE`          | Returns a single object from the database     | Yes           |
| `ARRAY`        | Returns a list of objects from the database   | Yes           |
| `PAGED`        | Returns paginated results with a total count  | Yes           |
| `CUSTOM_ONE`   | Returns a single object via your handler code | No            |
| `CUSTOM_ARRAY` | Returns a list via your handler code          | No            |
| `CUSTOM_PAGED` | Returns paginated data via your handler code  | No            |

### Standard Routes (`ONE`, `ARRAY`, `PAGED`)

Standard routes generate SQL automatically based on:

-   Base table selection
-   Joins to related tables
-   Where clauses for filtering
-   Response property mappings
-   Order by and group by specifications

### Custom Routes (`CUSTOM_ONE`, `CUSTOM_ARRAY`, `CUSTOM_PAGED`)

Custom routes delegate to your TypeScript handler code. Use these when you need:

-   External API calls
-   Complex business logic
-   File processing
-   Authentication flows

---

## Route Properties

### Basic Properties

| Property        | Description                                           | Required |
| --------------- | ----------------------------------------------------- | -------- |
| **Type**        | Route type (`ONE`, `ARRAY`, `PAGED`, `CUSTOM_*`)      | Yes      |
| **Name**        | Descriptive name for the route                        | Yes      |
| **Description** | Documentation of what the route does                  | Yes      |
| **Method**      | HTTP method (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) | Yes      |
| **Path**        | URL path pattern (e.g., `/user/by-name`)              | Yes      |

### HTTP Methods

| Method   | Purpose        | Has Request Body | Typical Route Types     |
| -------- | -------------- | ---------------- | ----------------------- |
| `GET`    | Read data      | No               | `ONE`, `ARRAY`, `PAGED` |
| `POST`   | Create data    | Yes              | `ONE`, `CUSTOM_ONE`     |
| `PUT`    | Replace data   | Yes              | `ONE`, `CUSTOM_ONE`     |
| `PATCH`  | Partial update | Yes              | `ONE`, `CUSTOM_ONE`     |
| `DELETE` | Remove data    | No               | `ONE`, `CUSTOM_ONE`     |

### Paths

The **path** is the URL pattern for a route. Paths can include dynamic segments called **path parameters** that capture values from the URL:

| Pattern                          | Example URL          | Captured Value               |
| -------------------------------- | -------------------- | ---------------------------- |
| `/users/:id`                     | `/users/42`          | `id = 42`                    |
| `/orders/:orderId/items/:itemId` | `/orders/5/items/10` | `orderId = 5`, `itemId = 10` |

### Permission Properties

| Property   | Description                                      |
| ---------- | ------------------------------------------------ |
| **Roles**  | User roles allowed to access this route          |
| **Scopes** | OAuth-style scopes required to access this route |

### Deprecation

Mark routes as deprecated to warn consumers before removal:

| Property    | Description                                    |
| ----------- | ---------------------------------------------- |
| **Date**    | ISO date when the route will be removed        |
| **Message** | Optional explanation or migration instructions |

---

## Request Parameters

Parameters define the inputs your route accepts from callers.

### Parameter Properties

| Property        | Description                                       |
| --------------- | ------------------------------------------------- |
| **Name**        | Parameter name (use camelCase, e.g., `firstName`) |
| **Required**    | Whether the parameter must be provided            |
| **Validators**  | One or more validation rules (see below)          |
| **Is Nullable** | Whether the parameter can explicitly be `null`    |

### Parameter Sources

| Source              | Description                                        | Example              |
| ------------------- | -------------------------------------------------- | -------------------- |
| **Query string**    | Parameters passed in the URL                       | `?name=John`         |
| **Request body**    | Parameters sent as JSON in POST/PUT/PATCH requests | `{ "name": "John" }` |
| **Path parameters** | Dynamic segments captured from the URL             | `/users/:id`         |

### Parameter Prefixes

Use prefixes to reference parameters in where clauses and assignments:

| Prefix | Type             | Example      | Description                                 |
| ------ | ---------------- | ------------ | ------------------------------------------- |
| `$`    | Local parameter  | `$firstName` | A request parameter specific to this route  |
| `#`    | Global parameter | `#userId`    | A value from the authenticated user context |

---

## Parameter Validation

Validators ensure incoming data meets your requirements before processing.

### Validator Types

| Validator      | Description                                         | Value Format                                                             |
| -------------- | --------------------------------------------------- | ------------------------------------------------------------------------ |
| **Type Check** | Ensures the parameter matches an expected data type | `string`, `number`, `boolean`, `object`, `string[]`, `number[]`, `any[]` |
| **Min**        | Enforces a minimum value for numbers                | Number (e.g., `0`)                                                       |
| **Max**        | Enforces a maximum value for numbers                | Number (e.g., `100`)                                                     |
| **One Of**     | Restricts values to a specific allowed set          | Comma-separated values (e.g., `active,pending,closed`)                   |

### Validation Flow

1. **Request validation** – Incoming parameters are checked against defined validators
2. **Coercion** – Query string parameters are automatically converted to expected types (strings become numbers, booleans, etc.)
3. **Processing** – If validation passes, the request proceeds to SQL generation or handler code

### Multiple Validators

You can apply multiple validators to a single parameter:

```
name: quantity
validators:
  - Type Check: number
  - Min: 1
  - Max: 1000
```

---

## Response Configuration

### Standard Route Responses

Standard routes build responses by mapping database columns to output properties.

| Term                  | Description                                                           |
| --------------------- | --------------------------------------------------------------------- |
| **Response property** | A field returned in the API response                                  |
| **Selector**          | A column reference that maps a database column to a response property |

### Selector Format

| Source              | Format                 | Example                  |
| ------------------- | ---------------------- | ------------------------ |
| Base table column   | `{table}.{column}`     | `user.firstName`         |
| Joined table column | `{joinAlias}.{column}` | `companyId_company.name` |
| Custom expression   | Raw SQL expression     | `TRUE`, `COUNT(*)`       |

### Response Wrappers

| Type                 | Description                                        | Format                          |
| -------------------- | -------------------------------------------------- | ------------------------------- |
| **Wrapped response** | Standard format that puts data inside a wrapper    | `{ "data": { ... } }`           |
| **Paged response**   | Contains data array and total count for pagination | `{ "data": [...], "total": N }` |

### DELETE Responses

DELETE routes return `{ data: true }` on success.

### Custom Route Responses

Custom routes specify a response type:

| Option    | Description                                          |
| --------- | ---------------------------------------------------- |
| `boolean` | Returns a boolean value                              |
| `string`  | Returns a string value                               |
| `number`  | Returns a numeric value                              |
| Custom    | Returns a custom TypeScript interface you've defined |

---

## Pagination

Paged routes (`PAGED` and `CUSTOM_PAGED`) automatically handle pagination.

### Automatic Parameters

When you select `PAGED` type, these parameters are added automatically:

| Parameter   | Type     | Description                      | Default |
| ----------- | -------- | -------------------------------- | ------- |
| `page`      | `number` | Current page number (1-indexed)  | `1`     |
| `perPage`   | `number` | Number of items per page         | `10`    |
| `filter`    | `string` | Dynamic where condition string   | —       |
| `sortBy`    | `string` | Column name to sort by           | —       |
| `sortOrder` | `string` | Sort direction (`ASC` or `DESC`) | `ASC`   |

### Paged Response Format

```json
{
	"data": [
		{ "id": 1, "name": "Item 1" },
		{ "id": 2, "name": "Item 2" }
	],
	"total": 150
}
```

---

## SQL Query Building

Standard routes automatically generate SQL based on your configuration.

### Base Table

The primary table this route queries. Determines which columns are available for filtering and response mapping.

### Joins

Combine data from related tables.

| Property           | Description                                           |
| ------------------ | ----------------------------------------------------- |
| **Table**          | The related table to join                             |
| **Local Column**   | The foreign key column in your base (or joined) table |
| **Foreign Column** | The column in the related table (typically `id`)      |
| **Type**           | Join type: `INNER` or `LEFT`                          |
| **Alias**          | Short name for referencing joined columns             |

#### Join Types

| Type      | Description                                                                       |
| --------- | --------------------------------------------------------------------------------- |
| **INNER** | Only returns rows where matching records exist in both tables                     |
| **LEFT**  | Returns all rows from the left table, with NULL for non-matching right table rows |

#### Join Alias Convention

Aliases follow the format: `{localColumn}_{foreignTable}`

Example: Joining `user.companyId` to `company.id` creates alias `companyId_company`

### Where Clauses

Filter which rows are returned or affected.

| Property        | Description                                                  |
| --------------- | ------------------------------------------------------------ |
| **Table**       | The table containing the column to filter                    |
| **Column**      | The column to compare                                        |
| **Operator**    | The comparison type                                          |
| **Value**       | The value to compare against (can use `$param` or `#global`) |
| **Conjunction** | Logical connector to previous condition (`AND` or `OR`)      |
| **Custom**      | Raw SQL expression (alternative to column-based filter)      |

#### Operators

| Operator      | Description                      | Example                    |
| ------------- | -------------------------------- | -------------------------- |
| `=`           | Equals                           | `user.id = $id`            |
| `!=`          | Not equals                       | `status != 'deleted'`      |
| `<`           | Less than                        | `price < $maxPrice`        |
| `>`           | Greater than                     | `createdOn > $since`       |
| `<=`          | Less than or equal               | `quantity <= $max`         |
| `>=`          | Greater than or equal            | `age >= 18`                |
| `LIKE`        | Pattern match (use `%` wildcard) | `name LIKE $search`        |
| `NOT LIKE`    | Negative pattern match           | `email NOT LIKE '%test%'`  |
| `IN`          | Match any value in set           | `status IN $statuses`      |
| `NOT IN`      | Exclude values in set            | `role NOT IN ('guest')`    |
| `STARTS WITH` | String prefix match              | `name STARTS WITH $prefix` |
| `ENDS WITH`   | String suffix match              | `email ENDS WITH $domain`  |
| `IS`          | Identity comparison              | `deletedOn IS NULL`        |
| `IS NOT`      | Negative identity                | `manager IS NOT NULL`      |

### Order By

Sort query results (available for `ARRAY` and `PAGED` types).

| Property   | Description                      |
| ---------- | -------------------------------- |
| **Table**  | Table containing the sort column |
| **Column** | Column to sort by                |
| **Order**  | Direction: `ASC` or `DESC`       |

### Group By

Aggregate rows by a column value.

| Property   | Description                       |
| ---------- | --------------------------------- |
| **Table**  | Table containing the group column |
| **Column** | Column to group by                |

### Assignments

Value mappings for INSERT/UPDATE operations (`POST`, `PUT`, `PATCH` methods).

| Property  | Description                                         |
| --------- | --------------------------------------------------- |
| **Name**  | The column name to assign a value to                |
| **Value** | The value to assign (can use `$param` or `#global`) |

### Subqueries

Nested queries within a response that fetch related data from another table.

| Property       | Description                           |
| -------------- | ------------------------------------- |
| **Table**      | The related table to query            |
| **Joins**      | Additional joins within the subquery  |
| **Where**      | Conditions to filter subquery results |
| **Properties** | Fields to return from the subquery    |
| **Group By**   | Optional grouping                     |
| **Order By**   | Optional sorting                      |

---

## File Uploads

Custom routes can accept file attachments.

| Upload Type  | Description              |
| ------------ | ------------------------ |
| **Single**   | Accepts exactly one file |
| **Multiple** | Accepts multiple files   |

File upload is only available for custom routes and is configured in the API Details section.

---

## Custom Types

Define TypeScript types for use with custom routes.

### Creating Custom Types

1. Navigate to **Global** in the sidebar
2. Click the **Custom Types** tab
3. Click **Add Custom Type**
4. Write your TypeScript interface or type

```typescript
export interface AuthResponse {
	token: string;
	tokenExp: string;
	refreshToken: string;
	refreshTokenExp: string;
}
```

### Using Custom Types

| Usage             | Description                                         |
| ----------------- | --------------------------------------------------- |
| **Request type**  | The custom type for a custom route's expected input |
| **Response type** | The custom type for a custom route's returned data  |

Custom routes can use either:

-   **Standard request** – Individual validated parameters
-   **Custom request type** – A complete TypeScript interface

---

## Global Parameters

Values from the authenticated user context, available in all routes.

| Prefix | Example      | Usage                                              |
| ------ | ------------ | -------------------------------------------------- |
| `#`    | `#userId`    | Reference in where clauses: `user.id = #userId`    |
| `#`    | `#companyId` | Reference in assignments: `companyId = #companyId` |

Global parameters are configured in the **Global** section and are typically populated by your authentication handler.

---

## Error Handling

### Standard Error Codes

| Code               | HTTP Status | Description                       |
| ------------------ | ----------- | --------------------------------- |
| `BAD_REQUEST`      | 400         | Invalid request parameters        |
| `UNAUTHORIZED`     | 401         | Missing or invalid authentication |
| `FORBIDDEN`        | 403         | Insufficient permissions          |
| `NOT_FOUND`        | 404         | Resource not found                |
| `VALIDATION_ERROR` | 422         | Request validation failed         |
| `SERVER_ERROR`     | 500         | Internal server error             |

### Error Response Format

```json
{
	"error": {
		"code": "BAD_REQUEST",
		"message": "Parameter 'id' must be a number"
	}
}
```

---

## Custom Route Handlers

### File Naming Convention

Handler files are placed in `src/api/v1/` and named after the first path segment:

| Path            | Handler File        |
| --------------- | ------------------- |
| `/user/login`   | `user.api.v1.ts`    |
| `/order/status` | `order.api.v1.ts`   |
| `/weather`      | `weather.api.v1.ts` |

### Function Naming Convention

Function names combine the HTTP method with the path in PascalCase:

| Endpoint               | Function Name      |
| ---------------------- | ------------------ |
| `POST /user/login`     | `postUserLogin`    |
| `GET /user/me`         | `getUserMe`        |
| `POST /user/me/avatar` | `postUserMeAvatar` |
| `PATCH /order/status`  | `patchOrderStatus` |

### Handler Structure

```typescript
import type { RsRequest, RsResponse } from '@restura/core';

export default class UserApiV1 {
	constructor() {}

	async postUserLogin(req: RsRequest<Api.V1.User.Login.Post.Req>, res: RsResponse<Api.V1.User.Login.Post.Res>) {
		const { username, password } = req.data;

		// Your logic here...

		res.sendData({
			token: 'abc123',
			tokenExp: '2025-01-01T00:00:00.000Z'
		});
	}
}
```

---

## Quick Reference

### Route Type Decision Tree

```
Need custom logic?
├── Yes → CUSTOM_ONE, CUSTOM_ARRAY, or CUSTOM_PAGED
└── No → Standard route
         ├── Single record? → ONE
         ├── List of records? → ARRAY
         └── Paginated list? → PAGED
```

### Parameter Prefix Summary

| Prefix | Name             | Source                     | Example      |
| ------ | ---------------- | -------------------------- | ------------ |
| `$`    | Local parameter  | Request query/body         | `$firstName` |
| `#`    | Global parameter | Authenticated user context | `#userId`    |

### Glossary

| Term                  | Description                                                                       |
| --------------------- | --------------------------------------------------------------------------------- |
| **Endpoint**          | A group of related routes sharing the same base URL                               |
| **Route**             | A single API path that handles requests for a specific operation                  |
| **Standard route**    | A route that automatically generates SQL queries based on schema configuration    |
| **Custom route**      | A route that delegates to your own handler code instead of auto-generating SQL    |
| **Path parameter**    | A dynamic segment in a route path (e.g., `:id`) that captures values from the URL |
| **Local parameter**   | A request parameter specific to a route, referenced with `$` prefix               |
| **Global parameter**  | A value from the authenticated user context, referenced with `#` prefix           |
| **Selector**          | A column reference that maps a database column to a response property             |
| **Response property** | A field returned in the API response                                              |
| **Deprecation**       | A route property indicating the endpoint will be removed, with a date and message |
