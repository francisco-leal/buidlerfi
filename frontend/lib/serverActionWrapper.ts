"use server";

import * as jose from "jose";
import { ERRORS } from "./errors";

const SPKI = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE0yFanm3yTbCe4Z4KM9yi/IGZf+ugrj+rn82e/guPcFlyLiudyubOWqFFmL/bVdxDY5LFhJdvBwfDYKR8LwcmPg==
-----END PUBLIC KEY-----`;

const verificationKey = jose.importSPKI(SPKI, "ES256");

export interface ServerActionResponse<T> {
  data?: T;
  error?: (typeof ERRORS)[keyof typeof ERRORS];
}

export interface ServerActionOptions {
  authorization?: string | null;
}

export interface ServerActionData {
  userId: string;
}

//This wrapper is used to check authorization
//Servers actions need to throw an error in order to return a 500 error
//Without this, the client can't know if an error occured
export async function serverActionWrapper<T>(
  fn: (data: ServerActionData) => Promise<ServerActionResponse<T>>,
  options?: ServerActionOptions
) {
  if (!options?.authorization) throw new Error(ERRORS.UNAUTHORIZED);
  const verifKey = await verificationKey;
  const authToken = options.authorization.replace("Bearer ", "");
  const payload = authToken
    ? await jose.jwtVerify(authToken, verifKey, {
        issuer: "privy.io",
        audience: process.env.PRIVY_APP_ID
      })
    : undefined;
  if (!payload?.payload.sub) throw new Error(ERRORS.UNAUTHORIZED);
  const res = await fn({ userId: payload.payload.sub })
    .catch(err => {
      console.error(err);
      throw new Error(ERRORS.SOMETHING_WENT_WRONG);
    })
    .then(res => {
      if (res.error) throw new Error(res.error);
      else return res;
    });

  return res;
}
