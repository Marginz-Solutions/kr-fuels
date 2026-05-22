import { DecodedIdToken } from "firebase-admin/auth";
import { NextRequest } from "next/server";
import { adminAuth } from "../firebase/admin";

export const verifySession = async (req:NextRequest):Promise<DecodedIdToken| null>=>{
  const session = req.cookies.get("session")?.value
  console.log(session)
  if(!session) return null;
  try{
    return await adminAuth.verifySessionCookie(session,true);
  }
  catch{
    return null
  }
}