import * as https from 'https'
import * as url from 'url';

export const request = (_url: string, _options: any, postData?: any): Promise<any> => {
  const parsedURL = url.parse(_url);
  const options = Object.assign({
    hostname: parsedURL.host,
    port: 443,
    path: parsedURL.pathname,
    method: "GET"
  }, _options)
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      res.setEncoding('utf8');
      let body = "";
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve(JSON.parse(body))
      })
    })
    req.on('error', (e) => {
      console.error(e);
      reject({ error: e });
    });
    if (postData) {
      req.write(postData)
    }
    req.end();
  })
}

export const postForm = (_url: string, params: any): Promise<any> => {
  const postData = Object.keys(params).map(key => {
    return key + "=" + encodeURIComponent(params[key]);
  }).join("&");
  return request(_url, {
    method: "POST",
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    }
  }, postData)
}
