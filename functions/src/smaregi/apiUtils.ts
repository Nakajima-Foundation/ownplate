import fetch from 'node-fetch';

let hostName = null;
let authHostName = null;

export const updateHost = (name) => {
  hostName = name;
};
export const updateAuthHost = (name) => {
  authHostName = name;
};

export const generateBody = (obj) => {
  if (obj === null || obj === undefined) {
    return "";
  }
  return Object.keys(obj).map((key) => {
    return (obj[key] === undefined || obj[key] === null) ? null : (
      Array.isArray(obj[key]) ? obj[key].map((ele) => {
        return key + "[]=" + ele;
      }).join("&") : (key + "=" + obj[key])
    );
  }).filter((str) => { return str !== null; }).join("&");
}

export const authentication = async (clientId, clientSecret, contractId, scopes) => {
  const buff = Buffer.from([clientId, clientSecret].join(":"));
  const base64str = buff.toString('base64');

  const res = await fetch(`https://${authHostName}/app/${contractId}/token`, {
    method: 'post',
    headers: {
      "Authorization": "Basic " + base64str,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: generateBody({
      "grant_type": "client_credentials",
      "scope": scopes.join(" "),
    })
  });
  if (res.status !== 200) {
    throw new Error("AuthenticationFailed");
  }
  return await res.json()
}

const actual_call = async (requst_url, options) => {
  const res = await fetch(requst_url, options);
  if (res.status === 200) {
    try {
      return await res.json();
    } catch (e) {
      console.log(e);
      return {};
    }
  }
  await res.text();
  // const response = await res.json();
  return {
    result: false,
    status: res.status,
//    payload: response,
  };
}

const api_call = async (contractId, path, access_token, method, data = {}) => {
  const full_path = `https://${hostName}/${contractId}/pos/`;
  let requst_url = full_path + path;
  const options: any = {
    method,
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': "application/json",
      'Accept': "application/json",
    }
  }
  if (method === "GET") {
    const query = Object.keys(data).map(k => {
      return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]);
    }).join('&');
    requst_url = requst_url + "?" + query;
  } else {
    options.body = JSON.stringify(data);
  }
  return await actual_call(requst_url, options);
}

export const get_func = async (contractId, path, access_token, data) => {
  return await api_call(contractId, path, access_token, "GET", data);
}

export const post_func = async (contractId, path, access_token, data) => {
  return await api_call(contractId, path, access_token, "POST", data);
}

export const patch_func = async (contractId, path, access_token, data) => {
  return await api_call(contractId, path, access_token, "PATCH", data);
}

export const delete_func = async (contractId, path, access_token, data) => {
  return await api_call(contractId, path, access_token, "DELETE", data);
}
