#!/bin/bash

git filter-branch --tree-filter '
  if [ -f package.json ]; then
    sed -i "s/\"license\": \"MIT\"/\"license\": \"Apache-2.0\"/g" package.json
  fi
  # We do not change package-lock.json globally because it contains third party licenses.
  # We only change the root package license in package-lock.json if it exists.
  if [ -f package-lock.json ]; then
    # replace first occurrence (which is usually the root project) or just let it be.
    # It is safer not to touch package-lock.json third-party libs.
    # Only replace if it is the root:
    sed -i "0,/\"license\": \"MIT\"/s//\"license\": \"Apache-2.0\"/" package-lock.json
  fi
' --msg-filter 'sed "s/\bMIT\b/Apache-2.0/g; s/\bmit\b/Apache-2.0/g"' --force HEAD
