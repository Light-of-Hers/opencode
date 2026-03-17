#!/usr/bin/env bash
set -euo pipefail

root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
bin_dir="${HOME}/.local/bin"
opencode_dev="${bin_dir}/opencode-dev"
opencode_install="${bin_dir}/opencode-install-dev"

if ! command -v git >/dev/null 2>&1; then
  echo "git is required" >&2
  exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "curl is required" >&2
  exit 1
fi

mkdir -p "$bin_dir"

bun="${HOME}/.bun/bin/bun"
if ! command -v bun >/dev/null 2>&1 && [ ! -x "$bun" ]; then
  curl -fsSL https://bun.sh/install | bash
fi

if command -v bun >/dev/null 2>&1; then
  bun="$(command -v bun)"
fi

PATH="${HOME}/.bun/bin:${PATH}"

"$bun" install --cwd "$root"

cat >"$opencode_dev" <<EOF
#!/usr/bin/env bash
set -euo pipefail

root="$root"
bun="\${HOME}/.bun/bin/bun"

if [ ! -x "\$bun" ]; then
  if command -v bun >/dev/null 2>&1; then
    bun="\$(command -v bun)"
  else
    echo "bun not found" >&2
    exit 1
  fi
fi

base="\$(sed -n 's/^[[:space:]]*"version": "\([^"]*\)",$/\1/p' "\$root/packages/opencode/package.json" | sed -n '1p')"
channel="\$(git -C "\$root" branch --show-current 2>/dev/null || true)"
if [ -z "\$channel" ]; then
  channel="local"
else
  channel="\$channel - local"
fi

PATH="\${HOME}/.bun/bin:\${PATH}" \
OPENCODE_CWD="\${PWD}" \
OPENCODE_BASE_VERSION="\$base" \
OPENCODE_CHANNEL="\$channel" \
exec "\$bun" --cwd "\$root/packages/opencode" src/index.ts "\$@"
EOF

cat >"$opencode_install" <<EOF
#!/usr/bin/env bash
set -euo pipefail

root="$root"
bun="\${HOME}/.bun/bin/bun"
bin_dir="\${HOME}/.local/bin"
link="\$bin_dir/opencode"

if [ ! -x "\$bun" ]; then
  if command -v bun >/dev/null 2>&1; then
    bun="\$(command -v bun)"
  else
    echo "bun not found" >&2
    exit 1
  fi
fi

mkdir -p "\$bin_dir"
PATH="\${HOME}/.bun/bin:\${PATH}" "\$bun" run --cwd "\$root/packages/opencode" build --single
git -C "\$root" restore -- bun.lock
bins=("\$root"/packages/opencode/dist/opencode-*/bin/opencode)
if [ ! -e "\${bins[0]}" ]; then
  echo "built binary not found" >&2
  exit 1
fi
bin="\${bins[0]}"
ln -sf "\$bin" "\$link"
"\$link" --version
EOF

chmod +x "$opencode_dev" "$opencode_install"

"$opencode_install"

echo "Configured development commands:"
echo "  opencode-dev"
echo "  opencode-install-dev"
