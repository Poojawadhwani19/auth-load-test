// src/main.test.ts
import { check } from "k6";

// src/helpers/token.ts
import http from "k6/http";
function generateAuthToken() {
  const payload = JSON.stringify({
    client_id: __ENV.client_id,
    client_secret: __ENV.client_secret,
    audience: "https://wow-nz-qa.woolworths-dev.auth0app.com/api/v2/",
    grant_type: "client_credentials"
  });
  const url = "https://wow-nz-qa.woolworths-dev.auth0app.com/oauth/token";
  const headers = {
    "Content-Type": "application/json"
  };
  console.log("POST URL:", url);
  console.log("POST Headers:", JSON.stringify(headers));
  console.log("POST Payload:", payload);
  const res = http.post(url, payload, { headers });
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

// src/helpers/user.ts
import http2 from "k6/http";
function createUser(authToken) {
  const randomEmail = `user_${Math.random().toString(36).substring(2, 10)}@example.com`;
  const payload = JSON.stringify({
    email: randomEmail,
    password: "Tester1!",
    connection: "wow-nz-auth",
    given_name: "John",
    family_name: "Doe",
    name: "John Doe",
    nickname: "johnny",
    user_metadata: {
      custom_field: "custom_value"
    }
  });
  console.log("Auth Token:", authToken);
  console.log("Create User Payload:", payload);
  const res = http2.post(
    "https://wow-nz-qa.woolworths-dev.auth0app.com/api/v2/users",
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`
      }
    }
  );
  console.log("Create User Response Status:", res.status);
  console.log("Create User Response Body:", res.body);
  if (res.status !== 201 && res.status !== 200) {
    throw new Error(`Failed to create user: ${res.status} ${res.body}`);
  }
  let data;
  try {
    if (typeof res.body !== "string") {
      throw new Error("Response body is not a string");
    }
    data = JSON.parse(res.body);
  } catch (e) {
    throw new Error("Failed to parse createUser response");
  }
  if (!data.user_id) {
    throw new Error("user_id not returned in create user response");
  }
  const authId = data.user_id;
  console.log("Auth ID:", authId);
  return {
    user_id: data.user_id,
    email: data.email,
    ...data
  };
}

// src/helpers/kctoken.ts
import http3 from "k6/http";
function generateKCToken() {
  const url = "https://iam-qa.woolworths.co.nz/realms/wwnz-internalsystems/protocol/openid-connect/token";
  const payload = `grant_type=client_credentials&client_id=${__ENV.client_id_KC}&client_secret=${__ENV.client_secret_KC}`;
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded"
  };
  console.log("POST URL:", url);
  console.log("POST Headers:", JSON.stringify(headers));
  console.log("POST Payload:", payload);
  const res = http3.post(url, payload, { headers });
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

// src/helpers/createuser.ts
import http4 from "k6/http";
function createRegistration(kcToken, auth0Id, email) {
  const url = "https://authregapi.qa.cdx.nz/api/v1/auth/register";
  const payload = JSON.stringify({
    email,
    auth0Id,
    profile: {
      firstName: "Test",
      lastName: "abjsdd",
      mobilePhoneNumber: "0221332408",
      dateOfBirth: "1999-06-26T05:18:11.444Z"
    },
    edrSetting: true,
    countdownSetting: true,
    welcomeEmailType: "edr_marketing"
  });
  console.log("Create registration payload:", payload);
  const headers = {
    "Content-Type": "application/json",
    accept: "application/json",
    Authorization: `Bearer ${kcToken}`,
    // Uses KC token
    "WoolworthsNZ-Request-User-Id": "x",
    "WoolworthsNZ-Request-System-Id": "x"
  };
  const res = http4.post(url, payload, { headers });
  console.log("Create registration response:", res.body);
  if (res.status !== 201 && res.status !== 200) {
    throw new Error(`Failed to create registration: ${res.status} ${res.body}`);
  }
}

// src/helpers/login.ts
import http5 from "k6/http";
function loginUser(kcToken, authId) {
  console.log("Login using authId:", authId);
  const url = `https://authregapi.qa.cdx.nz/api/v1/auth/login?auth0Id=${encodeURIComponent(
    authId
  )}`;
  const headers = {
    accept: "application/json",
    Authorization: `Bearer ${kcToken}`,
    "WoolworthsNZ-Request-User-Id": "x",
    "WoolworthsNZ-Request-System-Id": "x"
  };
  const start = Date.now();
  const res = http5.get(url, { headers });
  const duration = Date.now() - start;
  console.log(`[GET] ${url} - Status: ${res.status} - Duration: ${duration}ms`);
  console.log("Login response:", res.body);
  return res.status === 200;
}

// src/helpers/deleteauth.ts
import http6 from "k6/http";
function deleteUser(userId) {
  const token = generateAuthToken();
  const url = `https://wow-nz-qa.woolworths-dev.auth0app.com/api/v2/users/${encodeURIComponent(userId)}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };
  const res = http6.del(url, null, { headers });
  console.log(`[DELETE] ${url} - Status: ${res.status}`);
  if (res.status !== 204) {
    console.error(`User deletion failed for ${userId}. Status: ${res.status}, Body: ${res.body}`);
    throw new Error(`Failed to delete user: ${res.status}`);
  }
  return true;
}

// src/main.test.ts
function main_test_default() {
  const token = generateAuthToken();
  const kcToken = generateKCToken();
  const user = createUser(token);
  check(user, { "user created": (u) => !!(u && u.user_id) });
  createRegistration(kcToken, user.user_id, user.email);
  const loginSuccess = loginUser(kcToken, user.user_id);
  check(loginSuccess, { "login succeeded": (s) => s === true });
  const deleteSuccess = deleteUser(user.user_id);
  check(deleteSuccess, { "user deleted": (d) => d === true });
}
export {
  main_test_default as default
};
