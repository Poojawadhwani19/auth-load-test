import { check } from "k6";
import { generateAuthToken } from "./helpers/token";
import { createUser } from "./helpers/user";
import { generateKCToken } from "./helpers/kctoken";
import { createRegistration } from "./helpers/createuser";
import { loginUser } from "./helpers/login";
import { deleteUser } from "./helpers/deleteauth";

// Load test configuration: 100 users, 1 iteration each
/*
export const options = {
  stages: [
    // start with low number of calls/users, ramp up to maximum number, then move down to somewhere in-between
    // We could also do another test to really stretch the service and instead of 500 users, go up to 1000 users (perhaps for second run)
    { duration: "1m", target: 10 }, 
    { duration: "30s", target: 45 }, // ramp up to 45 users
    { duration: "2m", target: 500 }, // stay at 500 users
    { duration: "30s", target: 250 }, // ramp down
  ],
  thresholds: {
    // during low number of calls the response time was 0.5ms, during high volume response time was 190 ms. Somewhere in-between is the average
    // have suggested lower allowed failure rate of .1%
    http_req_failed: ["rate<0.001"], // Less than .1% failures allowed
    http_req_duration: [
      // I'm suggesting that we should aim for p95 and p99 to be less than the maximum response time of 200ms
      "p(95)<150", // 95% of requests <150 ms (your p(95)=150ms)
      "p(99)<3500", // 99% of requests <180ms (your p(99)=180ms)
      "avg<100", // Average response time <100ms
    ],
  },
};
*/
export default function () {
  const token = generateAuthToken();
  const kcToken = generateKCToken();
  const user = createUser(token); //

  check(user, { "user created": (u) => !!(u && u.user_id) });

  createRegistration(kcToken, user.user_id, user.email);

  const loginSuccess = loginUser(kcToken, user.user_id);
  check(loginSuccess, { "login succeeded": (s) => s === true });

  const deleteSuccess = deleteUser(user.user_id);
  check(deleteSuccess, { "user deleted": (d) => d === true });
}
