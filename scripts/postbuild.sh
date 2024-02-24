#!/bin/bash
set -ex

echo "installing cloudlare pages security headers file"

cat <<EOF | dd of="$1/_headers"
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: no-referrer
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  Permissions-Policy: document-domain=(), geolocation=(), camera=(), microphone=()

/_app/*
  X-Robots-Tag: noindex
  Cache-Control: no-cache

/_app/immutable/*
  ! X-Robots-Tag
  ! Cache-Control
  Cache-Control: public, immutable, max-age=31536000

/fonts/*
  Cache-Control: public, immutable, max-age=31536000

/favicons/*
  Cache-Control: public, immutable, max-age=31536000

https://:project.pages.dev/*
  ! X-Robots-Tag
  X-Robots-Tag: noindex

https://:version.:project.pages.dev/*
  ! X-Robots-Tag
  X-Robots-Tag: noindex
EOF