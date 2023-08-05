import { ownPlateConfig } from "@/config/project";
import * as Cookie from "cookie";

export const lineAuthRestaurantURL = (
  path: string,
  options: { [key: string]: string },
  client_id: string,
) => {
  return lineAuthURLBase(path, options, client_id);
};

export const lineAuthURL = (
  path: string,
  options: { [key: string]: string },
) => {
  return lineAuthURLBase(path, options, ownPlateConfig.line.LOGIN_CHANNEL_ID);
};

export const lineAuthURLBase = (
  path: string,
  options: { [key: string]: string },
  client_id: string,
) => {
  const state = "s" + Math.random();
  const nonce = "n" + Math.random();
  const query = {
    response_type: "code",
    client_id,
    redirect_uri: location.origin + path,
    scope: "profile openid email", // todo??
    bot_prompt: "aggressive",
    state,
    nonce,
  } as { [key: string]: string };
  const params = JSON.stringify(
    Object.assign({}, options || {}, { state, nonce })
  );
  const date = new Date();
  date.setTime(date.getTime() + 5 * 60 * 1000); // five minutes
  const cookie = `line_params=${encodeURIComponent(
    params
  )}; expires=${date.toUTCString()}; path=/`;
  console.log(cookie);
  document.cookie = cookie;

  const queryString = Object.keys(query)
    .map((key) => {
      return key + "=" + encodeURIComponent(query[key]);
    })
    .join("&");
  return `https://access.line.me/oauth2/v2.1/authorize?${queryString}`;
};

export const lineGuard = (nonce: string, state: string) => {
  const cookies = Cookie.parse(document.cookie);
  const params = JSON.parse(cookies.line_params);

  //console.log("lineGuard", state, params.state);
  if (state !== params.state || nonce !== params.nonce) {
    console.error("state", state, params.state);
    throw new Error("invalid state");
  }
  return params;
};

export const lineVerify = (state: string) => {
  const cookies = Cookie.parse(document.cookie);
  const params = JSON.parse(cookies.line_params);
  //console.log("lineVerify", state, params.state);
  return state === params.state;
};
