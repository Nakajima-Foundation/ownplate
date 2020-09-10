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
      itemName: "good menu",
    });
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

    console.log(response.text);

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

});
