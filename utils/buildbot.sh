CIRCLE_SHA1=`git rev-parse HEAD` 
curl -X POST --data-urlencode "payload={\"channel\": \"#p_demae\", \"username\": \"CiecleCI\", \"text\": \"開発環境に反映しました ${CIRCLE_SHA1}\", \"icon_emoji\": \":robot_face:\"}" ${SLACKURL}

 
