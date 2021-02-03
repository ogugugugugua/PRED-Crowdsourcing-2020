#! /bin/bash
mongoexport -d scribe_api_development -c classifications -o data.json --type json;
node data_export.js;
rm data_converted.json;
time=$(date "+%Y%m%d-%H%M%S")
echo "${time}"




# In the shell environment:

# RUN: sudo vim /etc/rsyslog.d/50-default.conf
# uncomment the line of "cron.* 	/var/log/cron.log"

# RUN: sudo  service rsyslog  restart

# RUN: touch /var/log/dataExportLog.log

# RUN: crontab -e

# ADD this line to the end of the file:
# 59 23 * * 0,1,2,3,4,5,6 /bin/bash /filePath/timer.sh > /var/log/dataExportLog.log

# Done. Data export will be done at 23:59 of each day. The new data will override the old data.