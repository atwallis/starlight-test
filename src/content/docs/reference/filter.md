---
title: Filter
description: Filter parameter in Restura
---

Complete reference for the `filter` query parameter syntax used in paged routes. The filter parameter enables dynamic client-side filtering of paginated results.

## Quick Reference

| Syntax Style      | Format                            | Example                                    |
| ----------------- | --------------------------------- | ------------------------------------------ |
| **New (compact)** | `(column,operator,value)`         | `(status,ne,DELETED)`                      |
| **Old (verbose)** | `(column:name,value:val,type:op)` | `(column:status,value:DELETED,type:exact)` |

Both syntaxes are supported. New syntax is recommended for readability and brevity.

## New Syntax (Recommended)

### Basic Format

```
(column,value)           # Implicit equality
(column,operator,value)  # Explicit operator
```

### Operators

| Operator  | SQL Equivalent  | Description                           | Example               |
| --------- | --------------- | ------------------------------------- | --------------------- |
| _(none)_  | `=`             | Equality (default)                    | `(status,ACTIVE)`     |
| `ne`      | `<>`            | Not equal                             | `(status,ne,DELETED)` |
| `gt`      | `>`             | Greater than                          | `(price,gt,100)`      |
| `gte`     | `>=`            | Greater than or equal                 | `(age,gte,18)`        |
| `lt`      | `<`             | Less than                             | `(stock,lt,10)`       |
| `lte`     | `<=`            | Less than or equal                    | `(score,lte,100)`     |
| `has`     | `ILIKE '%val%'` | Contains substring (case-insensitive) | `(name,has,test)`     |
| `sw`      | `ILIKE 'val%'`  | Starts with (case-insensitive)        | `(email,sw,admin)`    |
| `ew`      | `ILIKE '%val'`  | Ends with (case-insensitive)          | `(file,ew,.pdf)`      |
| `in`      | `IN (...)`      | Matches any value in set              | `(id,in,1\|2\|3)`     |
| `null`    | `IS NULL`       | Is null                               | `(deletedAt,null)`    |
| `notnull` | `IS NOT NULL`   | Is not null                           | `(createdAt,notnull)` |

Operators are **case-insensitive**: `GT`, `Gt`, `gt` all work identically.

### Column Paths

| Format                   | Description            | Example                      | SQL Output                             |
| ------------------------ | ---------------------- | ---------------------------- | -------------------------------------- |
| `column`                 | Single column          | `(status,ACTIVE)`            | `"status" = 'ACTIVE'`                  |
| `table.column`           | Table-qualified column | `(user.email,sw,admin)`      | `"user"."email"::text ILIKE 'admin%'`  |
| `table.column.jsonField` | JSON field access      | `(user.metadata.role,admin)` | `"user"."metadata"->>'role' = 'admin'` |

> **Limit**: Column paths cannot exceed 3 parts. `a.b.c.d` is rejected.

---

### Escaping Special Characters

| Character       | Escape Sequence | Example                 | Result                               |
| --------------- | --------------- | ----------------------- | ------------------------------------ | ---- |
| `,` (comma)     | `\,`            | `(name,Doe\, John)`     | `"name" = 'Doe, John'`               |
| `\|` (pipe)     | `\|`            | `(desc,has,A\|B)`       | `"desc"::text ILIKE '%A              | B%'` |
| `\` (backslash) | `\\`            | `(path,sw,C:\\Windows)` | `"path"::text ILIKE E'C:\\Windows%'` |

Spaces do **not** require escaping:

```
(name,has,John Doe)    →    "name"::text ILIKE '%John Doe%'
```

### IN Operator Values

Use pipes (`|`) to separate multiple values:

```
(id,in,1|2|3)                           →  "id" IN (1, 2, 3)
(status,in,ACTIVE|PENDING|PROCESSING)   →  "status" IN ('ACTIVE', 'PENDING', 'PROCESSING')
(status,in,In Progress|On Hold)         →  "status" IN ('In Progress', 'On Hold')
```

Escape literal pipes within values:

```
(tags,in,red\|green|blue|yellow)        →  "tags" IN ('red|green', 'blue', 'yellow')
```

### Logical Operators

| Operator | Description | Example         |
| -------- | ----------- | --------------- |
| `and`    | Logical AND | `(a,1)and(b,2)` |
| `or`     | Logical OR  | `(a,1)or(b,2)`  |

Operators are **case-insensitive**: `AND`, `And`, `and` all work identically.

#### Chaining Multiple Conditions

```
(a,1)and(b,2)and(c,3)     →  "a" = 1 AND "b" = 2 AND "c" = 3
(a,1)or(b,2)or(c,3)       →  "a" = 1 OR "b" = 2 OR "c" = 3
(a,1)and(b,2)or(c,3)      →  "a" = 1 AND "b" = 2 OR "c" = 3
```

### Negation

Prefix expressions with `!` to negate:

```
!(status,DELETED)             →  NOT ("status" = 'DELETED')
!(a,1)and(b,2)                →  NOT ("a" = 1) AND ("b" = 2)
(a,1)and!(b,2)                →  ("a" = 1) AND NOT ("b" = 2)
!(a,1)and!(b,2)               →  NOT ("a" = 1) AND NOT ("b" = 2)
```

### Grouping

Use parentheses to control precedence:

```
((a,1)or(b,2))                          →  (("a" = 1) OR ("b" = 2))
((a,1)or(b,2))and((c,3)or(d,4))         →  (("a" = 1) OR ("b" = 2)) AND (("c" = 3) OR ("d" = 4))
```

Negate entire groups:

```
!((a,1)or(b,2))                         →  NOT (("a" = 1) OR ("b" = 2))
((a,1)or(b,2))and!((c,3)or(d,4))        →  (("a" = 1) OR ("b" = 2)) AND NOT (("c" = 3) OR ("d" = 4))
```

> **Limit**: Maximum nesting depth is 1. Expressions like `(((a,1)or(b,2))and(c,3))` are rejected.

### Whitespace

Whitespace is allowed around logical operators and after commas:

```
(a,1) and (b,2)           →  "a" = 1 AND "b" = 2
(status, ACTIVE)          →  "status" = 'ACTIVE'
(price, gt, 100)          →  "price" > 100
```

Whitespace within values is preserved:

```
(name,John Doe)           →  "name" = 'John Doe'
(title,has,hello world)   →  "title"::text ILIKE '%hello world%'
```

## Old Syntax (Deprecated)

The verbose syntax is still supported for backwards compatibility.

### Basic Format

```
(column:columnName,value:val,type:operator)
```

### Type Operators

| Type               | SQL Equivalent  | Example                                          |
| ------------------ | --------------- | ------------------------------------------------ |
| `exact`            | `=`             | `(column:status,value:ACTIVE,type:exact)`        |
| `contains`         | `ILIKE '%val%'` | `(column:name,value:test,type:contains)`         |
| `startsWith`       | `ILIKE 'val%'`  | `(column:email,value:admin,type:startsWith)`     |
| `endsWith`         | `ILIKE '%val'`  | `(column:file,value:.pdf,type:endsWith)`         |
| `greaterThan`      | `>`             | `(column:price,value:100,type:greaterThan)`      |
| `greaterThanEqual` | `>=`            | `(column:price,value:100,type:greaterThanEqual)` |
| `lessThan`         | `<`             | `(column:stock,value:10,type:lessThan)`          |
| `lessThanEqual`    | `<=`            | `(column:score,value:100,type:lessThanEqual)`    |
| `isNull`           | `IS NULL`       | `(column:deletedAt,type:isNull)`                 |

When `type` is omitted:

-   With `value`: defaults to equality (`=`)
-   Without `value`: defaults to `IS NULL`

### Old Syntax Column Paths

```
(column:id,value:123,type:exact)                      →  "id" = 123
(column:orderV2.id,value:215)                         →  "orderV2"."id" = 215
(column:order.billingAddress.zip,value:47,type:contains)  →  "order"."billingAddress"->>'zip'::text ILIKE '%47%'
```

### Old Syntax Logical Operators

```
(column:id,value:251)or(column:id,value:278)
→  ("id" = 251) or ("id" = 278)

(column:id,value:215)AND(column:totalPriceCents,value:3069,type:greaterThan)
→  ("id" = 215) AND ("totalPriceCents" > 3069)
```

### Old Syntax Grouping and Negation

```
((column:id,value:251)or(column:id,value:278))AND(column:status,value:ACTIVE,type:exact)
→  (("id" = 251) or ("id" = 278)) AND ("status" = 'ACTIVE')

!(column:userId,value:15234,type:exact)
→  NOT ("userId" = 15234)

!(column:id,value:4504055,type:contains)and!(column:name,value:jim,type:endsWith)
→  NOT ("id"::text ILIKE '%4504055%') and NOT ("name"::text ILIKE '%jim')
```

## Syntax Comparison

| Operation        | New Syntax            | Old Syntax                                       |
| ---------------- | --------------------- | ------------------------------------------------ |
| Equality         | `(status,ACTIVE)`     | `(column:status,value:ACTIVE,type:exact)`        |
| Not equal        | `(status,ne,DELETED)` | —                                                |
| Contains         | `(name,has,test)`     | `(column:name,value:test,type:contains)`         |
| Starts with      | `(email,sw,admin)`    | `(column:email,value:admin,type:startsWith)`     |
| Ends with        | `(file,ew,.pdf)`      | `(column:file,value:.pdf,type:endsWith)`         |
| Greater than     | `(price,gt,100)`      | `(column:price,value:100,type:greaterThan)`      |
| Greater or equal | `(price,gte,100)`     | `(column:price,value:100,type:greaterThanEqual)` |
| Less than        | `(stock,lt,10)`       | `(column:stock,value:10,type:lessThan)`          |
| Less or equal    | `(score,lte,100)`     | `(column:score,value:100,type:lessThanEqual)`    |
| Is null          | `(deletedAt,null)`    | `(column:deletedAt,type:isNull)`                 |
| Is not null      | `(createdAt,notnull)` | —                                                |
| In set           | `(id,in,1\|2\|3)`     | —                                                |

## Value Types

Values are automatically typed based on content:

| Input      | Type   | SQL Output   |
| ---------- | ------ | ------------ |
| `123`      | Number | `123`        |
| `-45.67`   | Number | `-45.67`     |
| `ACTIVE`   | String | `'ACTIVE'`   |
| `John Doe` | String | `'John Doe'` |

## SQL Injection Prevention

The filter parser is designed to prevent SQL injection:

1. **Column names** are always double-quoted as SQL identifiers
2. **Values** are escaped using `pg-format` library
3. **Parentheses** in values are rejected by the grammar (cannot inject sub-expressions)
4. **SQL keywords** in values become harmless literals

Examples of safely escaped input:

```
(name,O'Brien)                          →  "name" = 'O''Brien'
(password,' OR '1'='1)                  →  "password" = ''' OR ''1''=''1'
(id,1; DROP TABLE users; --)            →  "id" = '1; DROP TABLE users; --'
(path,C:\\Windows\\System32)            →  "path" = E'C:\\Windows\\System32'
```

## Error Cases

The parser rejects malformed input with a `SyntaxError`:

| Invalid Input              | Reason                      |
| -------------------------- | --------------------------- |
| `()`                       | Empty expression            |
| `(field)`                  | Missing value               |
| `(field,)`                 | Empty value                 |
| `(field,gt,)`              | Empty operator value        |
| `(,value)`                 | Missing column              |
| `(a.b.c.d,value)`          | Column path exceeds 3 parts |
| `(((a,1)or(b,2))and(c,3))` | Nesting depth exceeds limit |
