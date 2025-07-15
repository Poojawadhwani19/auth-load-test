import http from "k6/http";

export function generateKCToken(): string {
  const url =
    "https://iam-uat.woolworths.co.nz/realms/wwnz-internalsystems/protocol/openid-connect/token";
  const payload =
    `grant_type=client_credentials` +
    `&client_id=${__ENV.client_id_KC}` +
    `&client_secret=${__ENV.client_secret_KC}`;
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
  };

  // Log the full request
  console.log("POST URL:", url);
  console.log("POST Headers:", JSON.stringify(headers));
  console.log("POST Payload:", payload);

  const res = http.post(url, payload, { headers });

  // Log the response from Keycloak
  console.log(`Keycloak token response: ${res.body}`);

  if (typeof res.body !== "string" || res.body === null) {
    throw new Error("Token response body is not a valid string");
  }

  let data;
  try {
    data = JSON.parse(res.body);
  } catch (e) {
    throw new Error("Failed to parse Keycloak token JSON response");
  }

  if (!data.access_token) {
    throw new Error("No access_token found in Keycloak response");
  }

  return data.access_token;
}
