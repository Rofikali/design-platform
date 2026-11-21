# Local Development Environment

## Target environment
- Host: Windows 11.
- Container runtime: Docker Desktop.
- Development container: Ubuntu 24.04.
- Editor: VS Code connected to the container.

This remains the intended owner workflow. As of 2026-11-21 the owner has not run/verified the app in a real local Ubuntu/Docker Compose environment. GitHub-hosted Ubuntu workflow and CI production Docker image builds have passed, but are NOT equivalent to local `docker compose up --build` or functional acceptance. Record exact host, image digest, commands, expected ports and results once actually executed.

## Repository and filesystem
Prefer keeping the active checkout in the Linux filesystem used by Docker Desktop/WSL2 rather than under a Windows-mounted path such as `/mnt/c`, when practical. This commonly improves Linux tool behavior and file I/O. Back up work and understand where the files physically live before moving an existing checkout.

## Container principles
- Pin the base image to an intentional Ubuntu 24.04 image tag; pin exact digests when reproducibility requirements justify it.
- Run as a non-root development user where practical.
- Mount source code and only the required build/cache directories.
- Do not mount the Docker socket into application containers.
- Do not put secrets into the Dockerfile, image layers, or committed Compose files.
- Use health checks and explicit resource limits for services that support them.
- Keep development convenience settings separate from production configuration.

## First implementation sequence
1. Add the minimal repository layout and toolchain files.
2. Add a reproducible development container and document prerequisites.
3. Verify Rust, Node.js/package manager, and WASM tooling versions from inside the container.
4. Run formatting, linting, and unit tests inside Ubuntu 24.04.
5. Record exact commands and observed outcomes in the PR.

## Resource-aware engineering
Before choosing export concurrency or limits, measure peak resident memory, CPU time, temporary disk use, and output size using representative exam-paper and banner documents. Do not infer production capacity from a successful build alone.
