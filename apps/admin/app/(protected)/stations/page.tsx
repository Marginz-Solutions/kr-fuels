import { serverFetch } from '@/lib/server-fetch'
import StationsPage from './StationsPage'

const page = async () => {
  const data = await serverFetch('/stations')
  
  return <StationsPage {...data} />
}

export default page