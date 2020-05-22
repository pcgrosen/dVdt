#!/bin/bash

cd $(dirname $(readlink -f "$0"))

for size in 16 24 32 36 48 128 256; do
    inkscape -e "dVdt-${size}.png" -w "$size" -h "$size" dVdt.svg
done
