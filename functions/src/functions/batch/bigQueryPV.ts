// import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

import moment from "moment-timezone";
import * as utils from "../../lib/utils";
import { ownPlateConfig } from "../../common/project";

import { BigQuery } from "@google-cloud/bigquery";

export const bigQueryPV = async (db: admin.firestore.Firestore) => {
  const bigquery = new BigQuery();

  // for await (const time of [3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]) {
  // console.log(time);
  const date = moment().tz(utils.timezone).subtract(2, "days").format("YYYYMMDD");
  const table = `${ownPlateConfig.analyticsId}.events_${date}`;

  const sqlQuery = `
select 
FORMAT_TIMESTAMP('%Y%m%d%H', TIMESTAMP_TRUNC(timestamp_micros(event_timestamp), SECOND), "Asia/Tokyo") AS time_second_jst,
event_name, 
REGEXP_REPLACE((SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key = 'page_location'), "/order/.*", "" ) as pagelocation,
COUNT(1) AS pageviews
from ${table}
 where event_name = "page_view"
 GROUP BY time_second_jst, event_name, pagelocation
having pagelocation like 'https://${ownPlateConfig.hostName}/r/%'
limit 1000`;

  const options = {
    query: sqlQuery,
    location: "asia-northeast1",
    params: { corpus: "romeoandjuliet", min_word_count: 400 },
  };

  try {
    const [rows] = await bigquery.query(options);
    // const ret: any[] = [];
    for await (const row of rows) {
      const { pagelocation, time_second_jst, pageviews } = row;

      const date_jst = time_second_jst.slice(0, 8);
      const hour_jst = time_second_jst.slice(8, 10);

      const restaurantId = pagelocation.split("/")[4];
      if (["favorites", "area"].includes(restaurantId)) {
        continue;
      }
      const path = `/restaurants/${restaurantId}/pageView/${date_jst}/pageViewData/${time_second_jst}`;
      console.log(path);
      const data = {
        restaurantId,
        id: `${time_second_jst}`,
        date: date_jst,
        hour: hour_jst,
        month: date_jst.slice(0, 6),
        pageviews,
        location: pagelocation,
      };
      await db.doc(path).set(data);
      // ret.push({path, data});
    }
  } catch (err) {
    console.error(err);
  }
  // }
  return {};
};
