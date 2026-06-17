import React from 'react'
import ContactPage from './ContactPage'
import { serverFetch } from '@/lib/server-fetch'

const page = async() => {
  const data = await serverFetch("/enquiry")

  return (
    <ContactPage {...data}/>
  )
}

export default page