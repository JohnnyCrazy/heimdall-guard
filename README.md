# Heimdall Guard

[![npm heimdall-guard](https://img.shields.io/npm/v/heimdall-guard?label=npm%20-%20heimdall-guard&style=flat-square)](https://www.npmjs.com/package/heimdall-guard)

A simple authorization module based on Attribute-based access control (ABAC). Inspired by [blitz-guard](https://github.com/ntgussoni/blitz-guard).

```ts
import { GuardBuilder } from 'heimdall-guard';

type MyCtx = { roles: string[] }
type CustomResources = 'blog-post';
type CustomActions = 'archive';

const { can } = GuardBuilder<CustomResources, CustomActions, MyCtx>((ctx, { can }) => {
  if (ctx.roles.include('user')) {
    can('archive', 'blog-post');
  }

  if (ctx.roles.include('admin')) {
    can('delete', 'blog-post');
  }
})

false === can('delete', 'blog-post', { roles: ["user"] })
true === can('delete', 'blog-post', { roles: ["admin"] })

true === can('delete', 'blog-post', { roles: ["admin", "user"] })
true === can('archive', 'blog-post', { roles: ["admin", "user"] })
```
