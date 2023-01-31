CIRCLE_SHA1=`git rev-parse HEAD` 
curl -X POST --data-urlencode "payload={\"channel\": \"#p_demae\", \"username\": \"Github\", \"text\": \"ビルドに失敗しました ${CIRCLE_SHA1}\nhttps://github.com/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}\", \"icon_emoji\": \":fire:\"}" ${SLACKURL}

 
