import http from "k6/http";

export function createRegistration(
  kcToken: string,
  auth0Id: string,
  email: string
): void {
  const url = "https://authregapi.qa.cdx.nz/api/v1/auth/register";

  const payload = JSON.stringify({
    email: email,
    auth0Id: auth0Id,
    profile: {
      firstName: "Test",
      lastName: "abjsdd",
      mobilePhoneNumber: "0221332408",
      dateOfBirth: "1999-06-26T05:18:11.444Z",
    },
    edrSetting: true,
    countdownSetting: true,
    welcomeEmailType: "edr_marketing",
  });

  console.log("Create registration payload:", payload); 

  const headers = {
    "Content-Type": "application/json",
    accept: "application/json",
    Authorization: `Bearer ${kcToken}`, // Uses KC token
    "WoolworthsNZ-Request-User-Id": "x",
    "WoolworthsNZ-Request-System-Id": "x",
  };

  const res = http.post(url, payload, { headers });

  console.log("Create registration response:", res.body);

  if (res.status !== 201 && res.status !== 200) {
    throw new Error(`Failed to create registration: ${res.status} ${res.body}`);
  }
}
