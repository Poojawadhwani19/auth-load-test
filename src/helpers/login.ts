import http from "k6/http";

// Only export the function, do not call anything at the top level!
export function loginUser(kcToken: string, authId: string) {
  console.log("Login using authId:", authId);

  const url = `https://authregapi.qa.cdx.nz/api/v1/auth/login?auth0Id=${encodeURIComponent(
    authId
  )}`;
  const headers = {
    accept: "application/json",
    Authorization: `Bearer ${kcToken}`,
    "WoolworthsNZ-Request-User-Id": "x",
    "WoolworthsNZ-Request-System-Id": "x",
  };

  const start = Date.now();
  const res = http.get(url, { headers });
  const duration = Date.now() - start;

  console.log(`[GET] ${url} - Status: ${res.status} - Duration: ${duration}ms`);
  console.log("Login response:", res.body);

  return res.status === 200;
}
