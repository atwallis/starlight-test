---
title: Database Permissions
description: Configuring table and column-level access control in Restura
---

Restura supports both table-level and column-level access control using roles and scopes.

## Table-Level Permissions

Control which users can access the entire table.

### Properties

| Property   | Description                          |
| ---------- | ------------------------------------ |
| **Roles**  | User roles that can query this table |
| **Scopes** | OAuth-style scopes for table access  |

### How It Works

**If a table has roles/scopes defined:**

-   Users without the required role/scope cannot query the table
-   An error is thrown: "You do not have permission to access this table"
-   The query is rejected before any data is accessed

**If a table has no roles/scopes:**

-   The table is considered public
-   Any authenticated (or unauthenticated) user can access it
-   Column-level permissions still apply

---

## Column-Level Permissions

Control which users can see specific columns in responses.

### Properties

| Property   | Description                                      |
| ---------- | ------------------------------------------------ |
| **Roles**  | User roles that can see this column in responses |
| **Scopes** | OAuth-style scopes for column access             |

### How It Works

**Columns with roles/scopes:**

-   Only included in responses if the user has the required access
-   Silently excluded if the user lacks permission
-   Cannot be used in WHERE clauses by unauthorized users

**Columns without roles/scopes:**

-   Included for all users who can access the table
-   Can be used in WHERE clauses by anyone

**If a user doesn't have access to any columns:**

-   The query fails with a permission error
-   At least one column must be accessible

---

## Permission Examples

### Public Table

```
Table: product
Roles: []
Scopes: []
```

Anyone can access products. All columns are visible to everyone.

### Admin-Only Table

```
Table: auditLog
Roles: ['ADMIN']
Scopes: []
```

Only admins can access the audit log table.

### Scope-Based Access

```
Table: user
Scopes: ['read:users']
```

Only users with the `read:users` scope can access the user table.

### Hide Sensitive Column

```
Table: user
Roles: []
Scopes: []

Column: socialSecurityNumber
Roles: ['ADMIN', 'HR']
Scopes: []
```

Everyone can access the user table, but only admins and HR can see social security numbers.

### Multiple Permission Levels

```
Table: order
Roles: []
Scopes: []

Column: customerEmail
Roles: ['ADMIN', 'MANAGER']
Scopes: []

Column: internalNotes
Roles: ['ADMIN']
Scopes: []
```

-   Everyone can see orders
-   Admins and managers can see customer emails
-   Only admins can see internal notes

---

## Common Permission Patterns

### Multi-Tenant Data Isolation

Use global parameters to filter data by company:

```
Table: order
Roles: []
Scopes: []

Endpoint: GET /api/v1/orders
Where: order.companyId = #companyId
```

Users can only see orders from their own company, enforced at the query level.

### Role-Based Column Access

```
Table: employee
Roles: []
Scopes: []

Columns:
  - firstName, lastName: [] (public)
  - email: ['ADMIN', 'HR'] (restricted)
  - salary: ['ADMIN', 'HR'] (restricted)
  - socialSecurityNumber: ['ADMIN', 'HR'] (restricted)
  - performanceReview: ['ADMIN', 'MANAGER'] (restricted)
```

Different roles see different levels of employee information.

### Hierarchical Permissions

```
Table: report
Roles: ['ADMIN', 'MANAGER', 'ANALYST']
Scopes: []

Column: financialData
Roles: ['ADMIN', 'MANAGER']
Scopes: []

Column: confidentialNotes
Roles: ['ADMIN']
Scopes: []
```

-   Analysts can see reports but not financial data
-   Managers can see financial data but not confidential notes
-   Admins can see everything

### Scope-Based API Access

```
Table: user
Scopes: ['read:users']

Column: email
Scopes: ['read:users:email']

Column: phone
Scopes: ['read:users:phone']

Column: address
Scopes: ['read:users:address']
```

Fine-grained OAuth scopes control what data third-party apps can access.

---

## Permission Enforcement

### Query-Time Filtering

Permissions are enforced when queries are executed:

1. **Table-level check** – Verify user has access to the table
2. **Column filtering** – Remove unauthorized columns from SELECT
3. **WHERE clause validation** – Ensure user can filter by specified columns
4. **Response filtering** – Remove unauthorized columns from results

### Example Query Flow

**User:** Manager with roles `['MANAGER']`

**Query:** `GET /api/v1/users?fields=firstName,email,salary`

**Table permissions:** `[]` (public)

**Column permissions:**

-   `firstName`: `[]` (public)
-   `email`: `['ADMIN', 'MANAGER']` (restricted)
-   `salary`: `['ADMIN', 'HR']` (restricted)

**Result:**

```json
{
	"data": [
		{
			"firstName": "John",
			"email": "john@example.com"
			// salary excluded - user lacks permission
		}
	]
}
```

---

## Combining with Endpoint Permissions

Endpoint permissions and database permissions work together:

### Endpoint Permission

```
Route: GET /api/v1/users
Roles: ['ADMIN', 'MANAGER']
```

Only admins and managers can call this endpoint.

### Database Permission

```
Table: user
Roles: []

Column: salary
Roles: ['ADMIN']
```

Managers can call the endpoint, but only admins can see salary data.

### Result

-   Admins see all user data including salaries
-   Managers see all user data except salaries
-   Other users get a 403 error before querying the database

Learn more about [endpoint permissions](/starlight-test/reference/endpoints/permissions/).

---

## Best Practices

### Start with Least Privilege

-   Grant minimum necessary permissions
-   Add permissions as needed, don't start with full access
-   Use table-level permissions for sensitive tables
-   Use column-level permissions for PII

### Use Roles for Internal Users

```
Roles: ['ADMIN', 'MANAGER', 'USER']
```

Roles are good for internal users with fixed permission levels.

### Use Scopes for API Access

```
Scopes: ['read:users', 'write:users', 'read:orders']
```

Scopes are good for third-party apps and fine-grained API access.

### Document Permission Requirements

Add comments explaining why permissions are set:

```
Table: payroll
Roles: ['ADMIN', 'HR']
Comment: "Contains sensitive salary and tax information"

Column: socialSecurityNumber
Roles: ['ADMIN', 'HR']
Comment: "PII - restricted to authorized personnel only"
```

### Test Permission Scenarios

Test with different user roles to ensure permissions work as expected:

```typescript
// Test as admin
const adminResponse = await fetch('/api/v1/users', {
	headers: { Authorization: `Bearer ${adminToken}` }
});
// Should see all columns

// Test as manager
const managerResponse = await fetch('/api/v1/users', {
	headers: { Authorization: `Bearer ${managerToken}` }
});
// Should see limited columns

// Test as guest
const guestResponse = await fetch('/api/v1/users', {
	headers: { Authorization: `Bearer ${guestToken}` }
});
// Should get 403 error
```

### Audit Permission Changes

Log when permissions are modified:

```typescript
await auditLog.record('permission_changed', {
	table: 'user',
	column: 'salary',
	oldRoles: ['ADMIN'],
	newRoles: ['ADMIN', 'HR'],
	changedBy: currentUser.id,
	timestamp: new Date()
});
```

---

## Security Considerations

### Never Trust Client Input

Always validate permissions server-side:

```typescript
// Bad: Client specifies which columns to return
const columns = req.query.columns; // Could include unauthorized columns
const users = await db.select(columns).from('user');

// Good: Server enforces column permissions
const users = await db.query.user.findMany({
	// Restura automatically filters columns based on user permissions
});
```

### Use Global Parameters for Data Isolation

```sql
-- Ensure users only see their own company's data
WHERE order.companyId = #companyId
```

This prevents users from accessing other companies' data by manipulating IDs.

### Protect Sensitive Columns

```
Column: passwordHash
Roles: [] // Never expose, even to admins
```

Some columns should never be returned in API responses.

### Implement Row-Level Security

Combine permissions with WHERE clauses:

```
Table: document
Roles: []

Endpoint: GET /api/v1/documents
Where: 
  document.ownerId = #userId 
  OR document.isPublic = true
```

Users can only see their own documents or public documents.

---

## Error Messages

### Table Permission Denied

```json
{
	"error": {
		"code": "FORBIDDEN",
		"message": "You do not have permission to access this table"
	}
}
```

### Column Permission Denied

Columns are silently excluded from results. No error is thrown unless the user has no access to any columns.

### No Accessible Columns

```json
{
	"error": {
		"code": "FORBIDDEN",
		"message": "You do not have permission to access any columns in this table"
	}
}
```

---

## Next Steps

-   [Learn about database tables](/starlight-test/reference/database/tables/)
-   [Configure columns](/starlight-test/reference/database/columns/)
-   [Set up endpoint permissions](/starlight-test/reference/endpoints/permissions/)
