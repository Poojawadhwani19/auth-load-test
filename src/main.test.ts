import { check } from "k6";
import { generateAuthToken } from "./helpers/token";
import { createUser } from "./helpers/user";
import { generateKCToken } from "./helpers/kctoken";
import { createRegistrationinDB } from "./helpers/createuser";
import { loginUser } from "./helpers/login";
import { deleteUser } from "./helpers/deleteauth";

// Load test configuration

/*
export const options = {
  stages: [
    { duration: "1m", target: 10 },
    { duration: "30s", target: 45 },
    { duration: "2m", target: 500 },
    { duration: "30s", target: 250 },
  ],

  thresholds: {
    http_req_failed: ["rate<0.001"],
    http_req_duration: ["p(95)<150", "p(99)<3500", "avg<100"],
    "http_req_duration{step:Login}": ["p(95)<200"],
  },
};
*/
export default function () {
  const token = generateAuthToken();
  const kcToken = generateKCToken();
  const user = createUser(token);

  check(user, { "user created": (u) => !!(u && u.user_id) });

  createRegistrationinDB(kcToken, user.user_id, user.email);

  // Track login time and tag it for better metrics
  const loginStart = Date.now();
  const loginSuccess = loginUser(kcToken, user.user_id);

  const loginDuration = Date.now() - loginStart;
  const loginCheck = check(loginSuccess, {
    "login succeeded": (s) => s === true,
  });

  // Optional: log login failures or slow responses
  if (!loginCheck || loginDuration > 500) {
    console.error(
      `Login failed or slow — success: ${loginSuccess}, duration: ${loginDuration}ms, user_id: ${user.user_id}`
    );
  }

  const deleteSuccess = deleteUser(user.user_id);
  check(deleteSuccess, { "user deleted": (d) => d === true });
}
