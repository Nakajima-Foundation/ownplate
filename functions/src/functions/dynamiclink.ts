//import * as functions from 'firebase-functions'
import fetch from 'node-fetch';


export const createlink = async () => {
  return fetch("https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=AIzaSyBOT4mp0ugYzoBOpSgf8aloh4dfAzZJdVE", {
    method: "POST",
    headers: {
      'Content-Type': "application/json",
      'Accept': "application/json",
    },
    body: JSON.stringify({
      "dynamicLinkInfo": {
        "domainUriPrefix": "https://staging.ownplate.today/m",
        "link": "https://staging.ownplate.today/r/121212"
      }
    })
  });
};

