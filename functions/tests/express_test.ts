import supertest from 'supertest';
import { should } from 'chai';
import { expect } from 'chai';

import * as express from '../src/functions/express';
import * as test_helper from './test_helper';
import * as test_db_helper from './test_db_helper';

should();

const adminDB = test_db_helper.adminDB();

express.updateDb(adminDB);
const app = express.app;
const request = supertest(app);

test_db_helper.initHook();

const good_cafe_data = {
  restProfilePhoto: "https://example.com/images",
  images: {
    profile: {
      resizedImages: {
        "600": "https://example.com/images600",
      },
    }
  },
  restaurantName: "Good cafe",
  introduction: "こんにちは",
  streetAddress: "NY",
  city: "NY",
  state: "NY",
  zip: "123",
  phoneNumber: "+01-0000-0000",
  url: "https://example.com",
  uid: "123123",
  defaultTaxRate: 10,
  publicFlag: true,
  deletedFlag: false,
};

describe('express function', () => {
  before(async () => {
    await adminDB.doc(`restaurants/testbar`).set(good_cafe_data);
    await adminDB.doc(`restaurants/testbar/menus/hoge`).set({
      images: {item: {resizedImages: {"600": "123.jpg"}}},
      itemDescription: "hello from menu",
      price: 1000,
      itemName: "good menu",
    });
    await adminDB.doc(`restaurants/testbar/menus/VbXMnx4wdTgh1VBpBRIr`).set({
      images: {item: {resizedImages: {"600": "123.jpg"}}},
      itemDescription: "hello from menu",
      price: 1000,
      itemName: "good menu",
    });
    await adminDB.doc(`restaurants/testbar/menus/DJHHNW17WqhT7O51lhxB`).set({
      images: {item: {resizedImages: {"600": "123.jpg"}}},
      itemDescription: "hello from menu",
      price: 1000,
      itemName: "good menu",
      itemOptionCheckbox: [
        "大盛り (+150),大盛り (+150),大盛り (+150),大盛り (+150),大盛り (+150),大盛り (+150),大盛り (+150),大盛り (+150),大盛り (0),大盛り (-150),",
        "豆(+150), +ーAZaz09, 割引(ー130)",
        "ひき肉 (+10),  チーズ, コーヒー",
      ]
    });
    await adminDB.doc(`restaurants/testbar/private/apikey`).set({
      apikey: "apiKeyMaster",
    });
    await adminDB.doc(`restaurants/testbar/orders/1212`).set(
      {
        "payment":{"stripe":"confirmed"},
        "timePlaced": {"seconds":1611631800,"nanoseconds":904000000},
        "totalCharge":1080,
        "uid":"hdLfvObioAWvymcZsGlq5PKL0CX2",
        "updatedAt":{"seconds":1611624589,"nanoseconds":130000000},
        "timeConfirmed":{"seconds":1611624580,"nanoseconds":857000000},
        "number":372,
        "tip":0,
        "orderAcceptedAt":{"seconds":1611624568,"nanoseconds":883000000},
        "status":650,
        "accounting":{
          "food":{"tax":80,"revenue":1000},
          "alcohol":{"tax":0,"revenue":0}},
        "memo":"",
        "rawOptions":{"VbXMnx4wdTgh1VBpBRIr":{"0":[]}},
        "tax":80,
        "orderPlacedAt":{"seconds":1611624550,"nanoseconds":383000000},
        "phoneNumber":"+819011111111",
        "timeEstimated":{"seconds":1611631800,"nanoseconds":904000000},
        "options":{"VbXMnx4wdTgh1VBpBRIr":{"0":[]}},
        "order":{"VbXMnx4wdTgh1VBpBRIr":[1]},
        "inclusiveTax":false,
        "name":"😃",
        "sendSMS":true,
        "timeCreated":{"seconds":1611624532,"nanoseconds":267000000},
        "description":"#372 Test good fave 0333333333 ETsB5oBUQNMG53zA8K8P",
        "menuItems":{"VbXMnx4wdTgh1VBpBRIr":{"price":1000,"itemName":"1212"}},
        "transactionCompletedAt":{"seconds":1611624589,"nanoseconds":130000000},
        "total":1080,
        "sub_total":1000
      });
    await adminDB.doc(`restaurants/testbar/orders/12123`).set(
      {"sendSMS":true,"tax":84,"sub_total":1051,"accounting":{"alcohol":{"revenue":0,"tax":0},"food":{"revenue":1051,"tax":84}},"updatedAt":{"seconds":1611624733,"nanoseconds":407000000},
       "menuItems":{"DJHHNW17WqhT7O51lhxB":{"itemName":"aaa 炒めももの","price":741,"category1":"222"}},"memo":"","timePlaced":{"seconds":1611631800,"nanoseconds":996000000},"totalCharge":1135,"phoneNumber":"+819011111111",
       "options": {
         "DJHHNW17WqhT7O51lhxB": {
           "0":["大盛り (+150)","豆(+150)","ひき肉 (+10)"]
         }
       },
       "name":"😃",
       "timeCreated":{"seconds":1611624725,"nanoseconds":303000000},
       "order":{"DJHHNW17WqhT7O51lhxB":[1]},
       "inclusiveTax":false,
       "number":374,"status":300,"total":1135,"rawOptions":{"DJHHNW17WqhT7O51lhxB":{"0":[0,0,0]}},"uid":"hdLfvObioAWvymcZsGlq5PKL0CX2","tip":0,"orderPlacedAt":{"seconds":1611624733,"nanoseconds":407000000}});
  });

  it ('express simple test', async function() {
    const response = await request.get('/users');
    response.status.should.equal(404);

    const restaurant_response = await request.get('/r/testbar');
    restaurant_response.status.should.equal(200);

    const meta_tag = test_helper.parse_meta(restaurant_response.text);

    meta_tag['og:title'].should.not.empty;
    meta_tag['og:title'].should.equal('Good cafe / テイクアウト・お持ち帰り / おもちかえり.com')
    meta_tag['og:site_name'].should.not.empty;
    meta_tag['og:type'].should.not.empty;
    meta_tag['og:image'].should.equal('https://example.com/images600');

    const restaurant_menu_response = await request.get('/r/testbar/menus/hoge');
    restaurant_menu_response.status.should.equal(200);

    const meta_menu_tag = test_helper.parse_meta(restaurant_menu_response.text);

    meta_menu_tag['og:title'].should.not.empty;
    meta_menu_tag['og:title'].should.equal('good menu / Good cafe')
    meta_menu_tag['og:site_name'].should.not.empty;
    meta_menu_tag['og:type'].should.not.empty;
    meta_menu_tag['og:image'].should.equal("123.jpg");
    meta_menu_tag['og:description'].should.equal('hello from menu');

    const restaurant_error_response = await request.get('/r/testbar2');
    restaurant_error_response.status.should.equal(404);
  });


  it ('express simple test', async function() {
    // const db_data = await adminDB.doc(`restaurants/testbar`).get();
    const response = await request.get('/users');
    response.status.should.equal(404);

    const restaurant_response = await request.get('/r/testbar');
    restaurant_response.status.should.equal(200);

    const meta_tag = test_helper.parse_meta(restaurant_response.text);

    meta_tag['og:title'].should.not.empty;
    meta_tag['og:title'].should.equal(good_cafe_data.restaurantName + " / テイクアウト・お持ち帰り / おもちかえり.com");
    meta_tag['og:site_name'].should.not.empty;
    meta_tag['og:type'].should.not.empty;
    meta_tag['og:image'].should.equal("https://example.com/images600");
  });

  it ('express sitemape test', async function() {
    const response = await request.get('/sitemap.xml');
    response.status.should.equal(200);
    // console.log(response.text);
  });


  it ('express api test', async function() {
    const response = await request.get('/api/1.0/restaurants').set("Origin", "http://localhost:3000");
    response.status.should.equal(200);
    console.log(response.headers['access-control-allow-origin']);
  });


  it ('express api cors test', async function() {
    const response = await request.get('/api/1.0/restaurants').set("Origin", "http://localhost:3000");
    response.status.should.equal(200);
    response.headers['access-control-allow-origin'].should.equal("http://localhost:3000");
  });

  it ('express api cors test', async function() {
    const response = await request.get('/api/1.0/restaurants').set("Origin", "http://localhost:8000");
    response.status.should.equal(200);
    response.headers['access-control-allow-origin'].should.equal("http://localhost:8000");
  });

  it ('express api cors test', async function() {
    const response = await request.get('/api/1.0/restaurants').set("Origin", "http://localhost:8000.example.com");
    response.status.should.equal(200);
    expect(response.headers['access-control-allow-origin']).equal(undefined);
  });

  it ('express api cors test', async function() {
    const response = await request.get('/api/1.0/restaurants').set("Origin", "http://localhostname:8000");
    response.status.should.equal(200);
    expect(response.headers['access-control-allow-origin']).equal(undefined);

  });

  it ('express api cors test', async function() {
    const response = await request.get('/api/1.0/restaurants').set("Origin", "https://test-aa.firebaseapp.com");
    response.status.should.equal(200);
    response.headers['access-control-allow-origin'].should.equal("https://test-aa.firebaseapp.com");
  });

  it ('express api cors test', async function() {
    const response = await request.get('/api/1.0/restaurants').set("Origin", "https://test-aa.vvv.firebaseapp.com");
    response.status.should.equal(200);
    expect(response.headers['access-control-allow-origin']).equal(undefined);
  });

  it ('express api cors test', async function() {
    const response = await request.get('/api/1.0/restaurants').set("Origin", "https://test.firebaseapp.com.hoge.com");
    response.status.should.equal(200);
    expect(response.headers['access-control-allow-origin']).equal(undefined);
  });

  it ('express api cors test', async function() {
    const response = await request.get('/api/1.0/restaurants').set("Origin", "https://test-aa.web.app");
    response.status.should.equal(200);
    response.headers['access-control-allow-origin'].should.equal("https://test-aa.web.app");
  });

  it ('express api key test', async function() {
    const response = await request.get('/api/2.0/restaurants/testbar/orders')
      .set("Authorization", "Bearer 123");
    response.status.should.equal(401);
  });
  
  it ('express api key test', async function() {
    const response = await request.get('/api/2.0/restaurants/testbar/orders');
    response.status.should.equal(401);
  });

  it ('express api key test', async function() {
    const response = await request.get('/api/2.0/restaurants/testbar/orders')
      .set("Authorization", "Bearer apiKeyMaster");
    response.status.should.equal(200);
    // console.log(JSON.stringify(JSON.parse(response.text), undefined, 1));
  });
  
});
