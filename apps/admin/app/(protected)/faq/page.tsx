import React from 'react'
import FAQPage from './FAQPage'
import { serverFetch } from '@/lib/server-fetch'

const page = async () => {
  const data = await serverFetch("/faq")
  return (
    <FAQPage {...data} />
  )
}

export default page