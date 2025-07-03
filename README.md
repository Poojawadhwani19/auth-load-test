this freamwork is created for preformance testing for login end point for registration api for auth.
we creating user in auth then fetching the authid then calling new registration create user end point passing same auth id which help us to create user in customerDB. then we fetch same auth id for login end point at the end we deleting all user for cleanup.
everytime first you have run npm run build it will generate test.js files under dist folder then you have to run npm run test 
note: If you did not define options in the script, k6 defaults to 1 VU for 1 iteration — unless overridden via command line.
if u want to run load testing export const options uncomment this update the thrshold as per you requirment.