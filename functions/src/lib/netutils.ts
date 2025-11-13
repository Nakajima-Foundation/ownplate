import * as https from "https";
import * as url from "url";

export const request = <T = unknown>(_url: string, _options: https.RequestOptions, postData?: string): Promise<T> => {
  const parsedURL = url.parse(_url);
  const options = Object.assign(
    {
      hostname: parsedURL.host,
      port: 443,
      path: parsedURL.pathname,
      method: "GET",
    },
    _options,
  );
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      res.setEncoding("utf8");
      let body = "";
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        resolve(JSON.parse(body));
      });
    });
    req.on("error", (e) => {
      console.error(e);
      reject({ error: e });
    });
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
};

export const postForm = <T = unknown>(_url: string, params: Record<string, string | number>): Promise<T> => {
  const postData = Object.keys(params)
    .map((key) => {
      return key + "=" + encodeURIComponent(params[key]);
    })
    .join("&");
  return request(
    _url,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(postData),
      },
    },
    postData,
  );
};

export const postJson = <T = unknown>(_url: string, _options: https.RequestOptions, json: unknown): Promise<T> => {
  const postData = JSON.stringify(json);
  console.log("postJson", postData);
  const headers = {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(postData),
  };
  if (_options.headers) {
    Object.assign(headers, _options.headers);
  }
  const options = Object.assign(
    {
      method: "POST",
    },
    _options,
    { headers },
  );
  return request(_url, options, postData);
};
