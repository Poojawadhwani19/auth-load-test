import http from "k6/http";

export interface CreatedUser {
  user_id: string;
  email: string;
  [key: string]: any;
}

export function createUser(authToken: string): CreatedUser {
  const randomEmail = `user_${Math.random()
    .toString(36)
    .substring(2, 10)}@example.com`;

  const payload = JSON.stringify({
    email: randomEmail,
    password: "Tester1!",
    connection: "wow-nz-auth",
    given_name: "John",
    family_name: "Doe",
    name: "John Doe",
    nickname: "johnny",
    user_metadata: {
      custom_field: "custom_value",
    },
  });

  // Log the token and payload for debugging
  console.log("Auth Token:", authToken);
  console.log("Create User Payload:", payload);

  const res = http.post(
    "https://wow-nz-uat.woolworths-dev.auth0app.com/api/v2/users",
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    }
  );

  // Log the response status and body
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

  const authId = data.user_id; // Store the Auth0 user ID in authId variable
  console.log("Auth ID:", authId);

  return {
    user_id: data.user_id,
    email: data.email,
    ...data,
  };
}
