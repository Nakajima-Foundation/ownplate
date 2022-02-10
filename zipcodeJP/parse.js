import * as admin from "firebase-admin";

const fs = require('fs');
const readline = require('readline');

const project = process.env.PROJECT || "ownplate-dev";
console.log(`project: ${project}`);
console.log(process.argv);

const prefCode = [
  { "code": 1, "name": "北海道"},
  { "code": 2, "name": "青森県"},
  { "code": 3, "name": "岩手県"},
  { "code": 4, "name": "宮城県"},
  { "code": 5, "name": "秋田県"},
  { "code": 6, "name": "山形県"},
  { "code": 7, "name": "福島県"},
  { "code": 8, "name": "茨城県"},
  { "code": 9, "name": "栃木県"},
  { "code": 10, "name": "群馬県"},
  { "code": 11, "name": "埼玉県"},
  { "code": 12, "name": "千葉県"},
  { "code": 13, "name": "東京都"},
  { "code": 14, "name": "神奈川県"},
  { "code": 15, "name": "新潟県"},
  { "code": 16, "name": "富山県"},
  { "code": 17, "name": "石川県"},
  { "code": 18, "name": "福井県"},
  { "code": 19, "name": "山梨県"},
  { "code": 20, "name": "長野県"},
  { "code": 21, "name": "岐阜県"},
  { "code": 22, "name": "静岡県"},
  { "code": 23, "name": "愛知県"},
  { "code": 24, "name": "三重県"},
  { "code": 25, "name": "滋賀県"},
  { "code": 26, "name": "京都府"},
  { "code": 27, "name": "大阪府"},
  { "code": 28, "name": "兵庫県"},
  { "code": 29, "name": "奈良県"},
  { "code": 30, "name": "和歌山県"},
  { "code": 31, "name": "鳥取県"},
  { "code": 32, "name": "島根県"},
  { "code": 33, "name": "岡山県"},
  { "code": 34, "name": "広島県"},
  { "code": 35, "name": "山口県"},
  { "code": 36, "name": "徳島県"},
  { "code": 37, "name": "香川県"},
  { "code": 38, "name": "愛媛県"},
  { "code": 39, "name": "高知県"},
  { "code": 40, "name": "福岡県"},
  { "code": 41, "name": "佐賀県"},
  { "code": 42, "name": "長崎県"},
  { "code": 43, "name": "熊本県"},
  { "code": 44, "name": "大分県"},
  { "code": 45, "name": "宮崎県"},
  { "code": 46, "name": "鹿児島県"},
  { "code": 47, "name": "沖縄県"}
].reduce((tmp, current) => {
  tmp[current['name']] = current;
  return tmp
}, {});

const sleep = async (seconds) => {
  return await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};

async function processLineByLine(db) {
  const fileStream = fs.createReadStream('zipcodeJP/conv.csv', "utf8");

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const trimDot = (text) => {
    return text.replace(/^"|"$/g, "").replace(/（.*）$/g, "");
  };
  const filterAddress = (text) => {
    if (text === "以下に掲載がない場合") return false;
    return true;
  };
  const hoge = {};

  for await (const line of rl) {
    const data = line.split(",");
    const zip = trimDot(data[2]);
    const prefecture = trimDot(data[6]);
    const fullAddress = [data[6], data[7], data[8]].map(trimDot).filter(filterAddress).join("");
    const address = [data[6], data[7], data[8]].map(trimDot).filter(filterAddress);

    const pref = prefCode[prefecture];
    
    if (!pref) {
      console.log(prefecture);
    }

    if (!hoge[zip]) {
      hoge[zip] = [];
    }
    hoge[zip].push({
      prefectureId: pref.code,
      prefecture,
      address,
      fullAddress
    });
  }
  let counter = 0;

  let batch = db.batch();

  for await (const zip of Object.keys(hoge)) {
    const {
      prefectureId,
      prefecture
    } = hoge[zip][0];
    const data = {
      addresses: hoge[zip].map(d => {
        return {
          prefectureId: d.prefectureId,
          prefecture: d.prefecture,
          address1: d.address[0]||"",
          address2: d.address[1]||"",
          address3: d.address[2]||""
        };
      }),
      fullAddresses: hoge[zip].map(d => d.fullAddress),
    };

    const path = "/zipcode/" + zip;
    batch.set(db.doc(path), data);
    
    if (counter === 400) {
      await batch.commit();
      batch = db.batch();
      console.log("DO");
      await sleep(1);
      counter = 0;
    } else {
      counter = counter + 1;
    }
  };
  await batch.commit();
}

const main = async () => {
  const serviceAccount = await import(`../batch/keys/${project}-firebase-adminsdk.json`);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${project}.firebaseio.com`
  });
  const db = admin.firestore();

  processLineByLine(db);

};

main();
