import supertest from 'supertest';
import { should } from 'chai';

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
};

describe('express function', () => {
  before(async () => {
    await adminDB.doc(`restaurants/testbar`).set(good_cafe_data);
  });

  it ('express simple test', async function() {
    const response = await request.get('/users');
    response.status.should.equal(404);

    const restaurant_response = await request.get('/r/testbar');
    restaurant_response.status.should.equal(200);

    const meta_tag = test_helper.parse_meta(restaurant_response.text);

    meta_tag['og:title'].should.not.empty;
    meta_tag['og:site_name'].should.not.empty;
    meta_tag['og:type'].should.not.empty;

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
    meta_tag['og:title'].should.equal(good_cafe_data.restaurantName);
    meta_tag['og:site_name'].should.not.empty;
    meta_tag['og:type'].should.not.empty;
    meta_tag['og:image'].should.equal("https://example.com/images600");


  });

  it ('express sitemape test', async function() {
    const response = await request.get('/sitemap.xml');
    response.status.should.equal(200);

    console.log(response.text);

  });

});
