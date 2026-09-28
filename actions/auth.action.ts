"use server";

import { cookies } from "next/headers";

export const createAuthCookie = async (token: string = "", rememberMe: boolean = true) => {
  // 30 days if rememberMe is true, otherwise 1 day
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
  cookies().set("userAuth", token, { 
    secure: process.env.NODE_ENV === "production",
    httpOnly: false, // Set to false so client can access it to attach as Bearer token in REST requests
    sameSite: "strict",
    path: "/",
    maxAge: maxAge
  });
};

export const deleteAuthCookie = async () => {
  cookies().delete("userAuth");
};
