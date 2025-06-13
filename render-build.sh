#!/usr/bin/env bash

corepack enable
corepack prepare pnpm@latest --activate
pnpm install
pnpm prisma generate
pnpm run build  # Only if you have a build step
