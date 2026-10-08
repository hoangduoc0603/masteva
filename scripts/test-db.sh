#!/usr/bin/env bash
# scripts/test-db.sh — test database và adapter Supabase trên Supabase local.
# Cần `supabase start` đang chạy. Khoá lấy từ `supabase status` (khoá mẫu của bản local, không phải bí mật thật).
set -euo pipefail
supabase test db
eval "$(supabase status -o env 2>/dev/null)"
SUPABASE_TEST_URL="$API_URL" \
SUPABASE_TEST_PUBLISHABLE_KEY="$PUBLISHABLE_KEY" \
SUPABASE_TEST_SECRET_KEY="$SECRET_KEY" \
SUPABASE_TEST_JWT_SECRET="$JWT_SECRET" \
  pnpm exec vitest run --config vitest.db.config.ts
