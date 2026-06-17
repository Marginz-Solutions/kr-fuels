import { doc, type DocumentData, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./client";

export async function getDocument<T>(collectionPath:string,docId:string):Promise<T|null>{
    const ref = doc(db,collectionPath,docId)
    const snap = await getDoc(ref)
    return snap.exists() ? ({id:snap.id,...snap.data()} as T):null
}

export async function setDocument<T extends DocumentData>(collectionPath:string,docId:string,data:Partial<T>):Promise<void> {
    const ref = doc(db,collectionPath,docId)
    await setDoc(ref,{...data,updatedAt:serverTimestamp()},{merge:true})    
}