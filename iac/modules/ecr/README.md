# ecr

One ECR repository per image (`colist-api`, `colist-web`). Tags are
**IMMUTABLE** so a `git-<sha>` tag can never be overwritten - every running
version is traceable and a rollback is a `workflow_dispatch` with the old tag.

Lifecycle policy:

1. untagged images expire 14 days after push,
2. only the last 10 images are kept (any tag status).

Scan-on-push is enabled.
