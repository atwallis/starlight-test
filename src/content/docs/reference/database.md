---
title: Database
---

Complete reference for configuring database tables, columns, indexes, and constraints in Restura.

## Tables

When you create a new table, Restura generates three default columns:

| Column       | Type      | Configuration                     |
| ------------ | --------- | --------------------------------- |
| `id`         | BIGSERIAL | Auto-increment, primary key       |
| `createdOn`  | DATETIME  | Not nullable, defaults to `now()` |
| `modifiedOn` | DATETIME  | Not nullable, defaults to `now()` |

---

## Column Properties

| Property         | Description                                          |
| ---------------- | ---------------------------------------------------- |
| **Name**         | Column name (use `camelCase`, e.g., `firstName`)     |
| **Type**         | Data type (see Column Types below)                   |
| **Column Value** | Values for ENUM, JSON, or DECIMAL precision          |
| **Length**       | Character length for VARCHAR/CHAR types              |
| **Auto Inc**     | Enable auto-increment (numeric types only)           |
| **Unique**       | Creates a unique index on this column                |
| **Nullable**     | Whether NULL values are allowed                      |
| **Default**      | Default value expression (e.g., `now()`, `'active'`) |
| **Comment**      | Documentation comment stored in the database         |
| **Permissions**  | Role and scope-based access control                  |

---

## Column Types

### Numeric Types

| Type                                                    | Description                                         |
| ------------------------------------------------------- | --------------------------------------------------- |
| `BOOLEAN`                                               | True/false values                                   |
| `TINYINT`, `SMALLINT`, `MEDIUMINT`, `INTEGER`, `BIGINT` | Integer types (various sizes)                       |
| `DECIMAL`                                               | Fixed-point decimal (set precision in Column Value) |
| `FLOAT`, `DOUBLE`                                       | Floating-point numbers                              |
| `BIGSERIAL`                                             | Auto-incrementing big integer                       |

### String Types

| Type                                         | Description                                |
| -------------------------------------------- | ------------------------------------------ |
| `CHAR(n)`, `VARCHAR(n)`                      | Fixed/variable length strings (set length) |
| `TEXT`                                       | Variable unlimited text                    |
| `TINYTEXT`, `MEDIUMTEXT`, `LONGTEXT`         | Text with size hints                       |
| `BLOB`, `TINYBLOB`, `MEDIUMBLOB`, `LONGBLOB` | Binary data                                |

### Date/Time Types

| Type        | Description             |
| ----------- | ----------------------- |
| `DATE`      | Date only (no time)     |
| `DATETIME`  | Date and time           |
| `TIME`      | Time only (no date)     |
| `TIMESTAMP` | Timestamp with timezone |

### Other Types

| Type    | Description                                        |
| ------- | -------------------------------------------------- |
| `ENUM`  | Enumerated values (define options in Column Value) |
| `JSON`  | JSON data                                          |
| `JSONB` | Binary JSON (PostgreSQL, faster queries)           |

---

## Smart Column Name Detection

Restura automatically configures columns based on naming patterns:

| Pattern                          | Auto Configuration                                                |
| -------------------------------- | ----------------------------------------------------------------- |
| `*Id` (e.g., `userId`)           | BIGINT type, creates index, creates foreign key to matching table |
| `id`                             | BIGINT, auto-increment, not nullable                              |
| `*On` (e.g., `createdOn`)        | DATETIME, not nullable, defaults to `now()`                       |
| `firstName`, `lastName`, `name`  | VARCHAR(30)                                                       |
| `address1`                       | VARCHAR(30)                                                       |
| `role`                           | ENUM with `'ADMIN','USER'` values                                 |
| `is*`, `has*` (e.g., `isActive`) | BOOLEAN, not nullable                                             |

---

## Indexes

| Property         | Description                                       |
| ---------------- | ------------------------------------------------- |
| **Name**         | Auto-generated based on table and columns         |
| **Unique**       | Enforces uniqueness across indexed columns        |
| **Order**        | Sort order: `ASC` or `DESC`                       |
| **Columns**      | One or more columns (composite index)             |
| **Where Clause** | Partial index condition (e.g., `isActive = true`) |

### Index Types

-   **Single-column index** - Index on one column for faster lookups
-   **Composite index** - Index on multiple columns for complex queries
-   **Unique index** - Prevents duplicate values
-   **Partial index** - Index only rows matching a WHERE condition
-   **Primary key** - Cannot be deleted, identifies each row uniquely

---

## Foreign Keys

| Property       | Description                                         |
| -------------- | --------------------------------------------------- |
| **Name**       | Auto-generated (e.g., `fk_order_userId_user_id`)    |
| **Column**     | The column in your table (must be BIGINT/BIGSERIAL) |
| **Ref Table**  | The table being referenced                          |
| **Ref Column** | The column being referenced (typically `id`)        |
| **On Delete**  | Action when the referenced row is deleted           |
| **On Update**  | Action when the referenced row is updated           |

### Foreign Key Actions

| Action        | Description                                         |
| ------------- | --------------------------------------------------- |
| `NO ACTION`   | Prevent delete/update if references exist (default) |
| `CASCADE`     | Automatically delete/update all referencing rows    |
| `SET NULL`    | Set the foreign key column to NULL                  |
| `RESTRICT`    | Like NO ACTION, but checked immediately             |
| `SET DEFAULT` | Set the foreign key column to its default value     |

---

## Check Constraints

Add custom SQL validation rules that must be true for all rows:

```sql
-- Examples
price > 0
quantity >= 0
status IN ('pending', 'active', 'completed')
end_date > start_date
```

---

## Notifications

Configure PostgreSQL `NOTIFY` triggers to emit events when rows change. Useful for real-time updates and event-driven architectures.

---

## Permissions

Columns can have role-based and scope-based access control:

-   **Roles** - User roles that can access this column (e.g., `ADMIN`, `USER`)
-   **Scopes** - OAuth-style scopes for fine-grained access (e.g., `read:users`, `write:users`)

---

## Filtering and Search

The Database page provides tools to manage large schemas:

### Filter Buttons

Toggle visibility of sections across all tables:

-   Columns
-   Indexes
-   Foreign Keys
-   Checks
-   Notifications

### Search

-   Type a table name to filter the list
-   Wrap in quotes for exact match: `"user"`
-   Type a column type (e.g., `BIGINT`) to find tables with that type
