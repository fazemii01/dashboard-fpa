"use server";

import { cookies } from "next/headers";

export const createAuthCookie = async (token: string = "") => {
  cookies().set("userAuth", token, { 
    secure: process.env.NODE_ENV === "production",
    httpOnly: false, // Set to false so client can access it to attach as Bearer token in REST requests
    sameSite: "strict",
    path: "/",
    maxAge: 3 * 60 * 60 // 3 hours in seconds
  });
};

export const deleteAuthCookie = async () => {
  cookies().delete("userAuth");
};
