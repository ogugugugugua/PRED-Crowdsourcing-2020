#!/usr/bin/
echo "Start exporting data...";
mongoexport -d scribe_api_development -c classifications -o data.json --type json;
echo "Start processing data...";
node data_export.js;
rm data_converted.json;