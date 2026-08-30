# Contributing

## Script conventions

### Naming

Lowercase only. `:` separates parts, `-` separates words.

```
name = lifecycle / main :check? :target? :option* :watch?
```

`lifecycle` = npm lifecycle scripts (`prepare`, `preinstall`, etc.). `main` = project-defined scripts from the table below.

### Order

Alphabetical in `package.json`.

### Main names

| Name      | Purpose                                |
| --------- | -------------------------------------- |
| `build`   | Generate files from source             |
| `clean`   | Remove artifacts, caches, node_modules |
| `dev`     | Dev server with watch/hot reload       |
| `fix`     | Auto-fix all issues (format + lint)    |
| `gen`     | Code generation from schemas/data      |
| `lint`    | Static analysis (read-only)            |
| `release` | Public side effects (publish, deploy)  |
| `start`   | Start a server/service                 |
| `stop`    | Stop a server/service                  |
| `test`    | Verify behavior                        |

### Umbrella scripts

If `lint:*` exists, `lint` SHOULD run all of them. Same for `build`, `test`, `gen`.

### Modifiers

Order: `:check` -> `:target` -> `:option` -> `:watch`

- `:check` - read-only validation, no file changes (e.g. `build:check`)
- `:target` - what it targets, not tool name. Good: `lint:types`. Bad: `lint:tsc`
- `:option` - extra options (e.g. `test:unit:coverage`)
- `:watch` - filesystem watcher (e.g. `test:unit:watch`)

### Exceptions

One-off dev tools (e.g. `get-jwt`) are OK. Not orchestrated by Turbo.
