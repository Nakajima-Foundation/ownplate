export const json_response = async (response) => {
  if (response.status >= 200 && response.status < 300) {
    const data = await response.json();
    return data;
  } else {
    const error_json = await response.json();
    const error = new Error(response.statusText);
    error.response = error_json;
    throw error;
  }
};

export const google_geocode = async (keyword) => {
  const parameters = {
    "address": keyword,
    "key": process.env.gapikey,
  };
  const qs = Object.keys(parameters).map((key) => {
    return `${key}=${encodeURIComponent(parameters[key])}`;
  }).join("&");

  const url = "https://maps.googleapis.com/maps/api/geocode/json?" + qs;
  const res = await fetch(url);
  const result = await json_response(res);
  if (result.status == "OK") {
    return result.results;
  } else {
    return false;
  }
};
