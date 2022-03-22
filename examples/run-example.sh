#!/usr/bin/env bash

DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
TOP=$(dirname "$DIR")
BINPATH="$TOP/bin/statreport"

which statreport &>/dev/null

if [[ $? -gt 0 ]]; then
  npm install -g statreport
fi

cd "$DIR"
statreport --file "input.csv" >"output.json"
