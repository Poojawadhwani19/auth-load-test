import http from "k6/http";

export function generateAuthToken(): string {
  const payload = JSON.stringify({
    client_id: __ENV.client_id,
    client_secret: __ENV.client_secret,
    audience: "https://wow-nz-uat.woolworths-dev.auth0app.com/api/v2/",
    grant_type: "client_credentials",
  });

  const url = "https://wow-nz-uat.woolworths-dev.auth0app.com/oauth/token";
  const headers = {
    "Content-Type": "application/json",
  };

  // Log the full request
  console.log("POST URL:", url);
  console.log("POST Headers:", JSON.stringify(headers));
  console.log("POST Payload:", payload);

  const res = http.post(url, payload, { headers });

  // 🔍 DEBUG LINE: Print the response from Auth0
  console.log(`Auth0 token response: ${res.body}`);

  if (typeof res.body !== "string" || res.body === null) {
    throw new Error("Response body is not a valid string");
  }

  let data;
  try {
    data = JSON.parse(res.body);
  } catch (e) {
    throw new Error("Failed to parse Auth0 token JSON response");
  }

  if (!data.access_token) {
    throw new Error("No access_token found in Auth0 response");
  }

  return data.access_token;
}
