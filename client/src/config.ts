// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
// const apiId = '10n7f5rmej'
const apiId = 'ev5rb5ozm3'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-62g6mhty.auth0.com',            // Auth0 domain
  clientId: 'UUdFKogwNI724CG6Pgqhz544ZLPMrhp1',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
