import http from "k6/http";
import { generateAuthToken } from "./token";

// Delete a user from Auth0 by user_id
export function deleteUser(userId: string) {
  const token = generateAuthToken();
  const url = `https://wow-nz-uat.woolworths-dev.auth0app.com/api/v2/users/${encodeURIComponent(
    userId
  )}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const res = http.del(url, null, { headers });

  console.log(`[DELETE] ${url} - Status: ${res.status}`);

  if (res.status !== 204) {
    console.error(
      `User deletion failed for ${userId}. Status: ${res.status}, Body: ${res.body}`
    );
    throw new Error(`Failed to delete user: ${res.status}`);
  }

  return true; // Return success boolean
}
