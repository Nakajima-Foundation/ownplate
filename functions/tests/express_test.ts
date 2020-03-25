import * as supertest from 'supertest';
import { should } from 'chai';

import * as express from '../src/functions/express';
import * as test_helper from './test_helper';

should();

const app = express.app;
const request = supertest(app);

describe('express function', () => {
  it ('express test', async function() {
    const response = await request.get('/users');
    response.status.should.equal(404);

    const hello_response = await request.get('/1.0/hello');
    hello_response.status.should.equal(200);

    const restaurant_response = await request.get('/r/hello');
    restaurant_response.status.should.equal(200);

    const meta_tag = test_helper.parse_meta(restaurant_response.text);

    meta_tag['og:title'].should.not.empty;
    meta_tag['og:site_name'].should.not.empty;
    meta_tag['og:type'].should.not.empty;

  });
});
