import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
// import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
// const certURL= 'https://dev-62g6mhty.auth0.com/.well-known/jwks.json'

const cert = `-----BEGIN CERTIFICATE-----
MIIDBzCCAe+gAwIBAgIJYOGvO7SS0Hk8MA0GCSqGSIb3DQEBCwUAMCExHzAdBgNV
BAMTFmRldi02Mmc2bWh0eS5hdXRoMC5jb20wHhcNMjAwMjIzMTExMTUxWhcNMzMx
MTAxMTExMTUxWjAhMR8wHQYDVQQDExZkZXYtNjJnNm1odHkuYXV0aDAuY29tMIIB
IjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1jqCooLZU+9At3+gtCginbgN
BPC2Pwukyyhq9wgHRgUWDbmzrGEEKCxmvHX6Hs5+pbmXLal3gu2TgxpiWcDTOylG
X4LHjw836IwGVeT/w2BCugAf1b5Up3mkp6egzKis5KwTV6IK53K3tEteiYicu5Vr
o8STfe+J3Z9u4JGDcbE2Gm3HBpd2ikT5qpRWmndabidKMyHwTUcHyXDW/vRfUTUK
1bl6hsfRH+8EFGsod6iMbkNhdQICvCnQtCykyqxi+ovaut+tduZW7TkwffKNtRbv
i68Rc9bAjThL4qAPXwVzE+5/2wgv7mM+2x9jOvhoCiumX5+I0M0Kqvo1oNk9yQID
AQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBTr5NjYSIn2MewsszEG
3gb1w7YPwjAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBALv6mL1H
wdaoaiK4sfg5/5Paj0njaP2Fi4qF6mKn4v5T1LGm9ZGHbqrOmXWBoph4WTWMT+Ky
XX0nl3cqnuApxrlmueovFMJ+gEEDz3JO8iLUG57lrzUTRXPwd0ADf2wWawe98NMF
X36+nT4kRQz9pkPcfbswfDE0GA7rgIZ1UIKZyAaAgfoKnqTR5bBkIaACsGL+r7Uh
qCDkSX+HmQFRZVO5N6lvgMcykPulEaI6tfRfG/8KnT7wvj7INlTWP91JR9HjD0nt
gKk9Jrde+7QOdsGUXzqO7mOOoDLRlphMWp3FZVlUsJI/qnUswWW43Rl0VbMCCHun
+mO+uVcGBGecHMc=
-----END CERTIFICATE-----
`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  console.log( verify, jwt);

  return verify(token, cert, { algorithms: ["RS256"] }) as JwtPayload;
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
