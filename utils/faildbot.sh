CIRCLE_SHA1=`git rev-parse HEAD` 
curl -X POST --data-urlencode "payload={\"channel\": \"#p_demae\", \"username\": \"Github\", \"text\": \"ビルドに失敗しました ${CIRCLE_SHA1}\", \"icon_emoji\": \":fire:\"}" ${SLACKURL}

 
