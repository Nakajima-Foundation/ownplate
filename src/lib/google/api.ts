import { GAPIKey } from "@/config/project";

export const json_response = async (response: Response) => {
  if (response.status >= 200 && response.status < 300) {
    const data = await response.json();
    return data;
  } else {
    const error_json = await response.json();
    const error = new Error(response.statusText);
    // error.response = error_json;
    throw error;
  }
};
interface GeoCodeParams {
  address: string;
  key: string;
}

export const google_geocode = async (keyword: string) => {
  const parameters = {
    address: keyword,
    key: GAPIKey,
  } as GeoCodeParams;
  const qs = Object.keys(parameters)
    .map((key: string) => {
      return `${key}=${encodeURIComponent(
        parameters[key as keyof GeoCodeParams]
      )}`;
    })
    .join("&");

  const url = "https://maps.googleapis.com/maps/api/geocode/json?" + qs;
  const res: Response = await fetch(url);
  const result = await json_response(res);
  if (result.status == "OK") {
    return result.results;
  } else {
    return false;
  }
};
