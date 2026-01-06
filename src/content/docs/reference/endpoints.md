---
title: Endpoints
---

-   **Endpoint** – A group of related routes sharing the same base URL (e.g., /api/v1/users).
-   **Base URL** – The common URL prefix shared by all routes within an endpoint group.
-   **Route** – A single API path that handles requests for a specific operation.
-   **Standard route** – A route that automatically generates SQL queries based on your schema configuration.
-   **Custom route** – A route that delegates to your own handler code instead of auto-generating SQL.
-   **Standard endpoint** – An endpoint containing standard routes that leverage automatic SQL generation.
-   **Custom endpoint** – An endpoint containing custom routes with hand-written business logic.
-   **HTTP method** – The request type: GET (read), POST (create), PUT/PATCH (update), or DELETE (remove).
-   **Path** – The URL pattern for a route, which can include dynamic segments (e.g., /users/:id).
-   **Path parameter** – A dynamic segment in a route path like :id that captures values from the URL.
-   **Deprecation** – A route property indicating the endpoint will be removed, with a date and message.

-   **Request parameter** – An input value expected by a route, from query string or request body.
-   **Required parameter** – A request parameter that must be provided for the request to succeed.
-   **Optional parameter** – A request parameter that can be omitted from the request.
-   **Response property** – A field returned in the API response.
-   **Selector** – A column reference that maps a database column to a response property (e.g., user.firstName).
-   **Wrapped response** – The standard response format that puts data inside a { data: … } wrapper.
-   **Unwrapped response** – A response sent exactly as-is without the data wrapper.
-   **Paged response** – A response containing both data array and total count for pagination.
-   **Error code** – A standardized identifier for error types like BAD_REQUEST or NOT_FOUND.
