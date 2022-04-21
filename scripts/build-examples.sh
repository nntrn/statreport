#!/usr/bin/env bash

DIR=$(cd "$(dirname "$0")/.." && pwd)
BINPATH="$DIR/bin/statreport"

cd $DIR/examples

CSVFILES=($(find . -type f -name "*.csv" -print))

for csvfile in "${CSVFILES[@]}"; do
  echo $csvfile
  cat $csvfile | $BINPATH >$csvfile.out.json
done
