#!/usr/bin/env bash

rollup app.js > prod.preview-links.js;

cp prod.preview-links.js wp-preview-links/;
cp style.css wp-preview-links/pl-styles.css;

cd wp-preview-links;
wp-gen build --packageManager 'echo' --buildCommand ' bye'

echo "all done 👋";

