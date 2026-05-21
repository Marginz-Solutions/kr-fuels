"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { auth } from "@/lib/firebase/client"

interface AuthContextType { user: User | null; loading: boolean }

const AuthContext = createContext<AuthContextType>({user:null,loading:true})

export function AuthProvider(props: Readonly<{children: React.ReactNode}>){
    const { children } = props
    const [user,setUser]= useState<User|null>(null)
    const [loading,setLoading] = useState<boolean>(true)

    useEffect(()=>{
        const unsubs = onAuthStateChanged(auth,(user)=>{
            setUser(user)
            setLoading(false)
        })
        return unsubs;
    }, [])

    return (
        <AuthContext.Provider value={{user,loading}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = ()=> useContext(AuthContext)

