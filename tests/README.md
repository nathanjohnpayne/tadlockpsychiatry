# Tests

Automated validation lives here. Tests must not be deleted to force a
build to pass (see `rules/repo_rules.md`).

## Conventions

- Default test glob is `tests/**/*.test.*`. Shell-based tests are
  matched via the `test_globs` entry in `.repo-template.yml`.
- Each `specs/<spec_id>.md` should have a matching test whose basename
  contains `<spec_id>`. When a non-default mapping is needed, list it
  in `.repo-template.yml` under `spec_test_map`.

## Current Tests

(none yet — add tests alongside the first spec)
