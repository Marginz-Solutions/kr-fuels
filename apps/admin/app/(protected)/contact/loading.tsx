import TableSkeleton from '@/components/ui/TableSkeleton'
import { TabSwitcherSkeleton } from '@/components/ui/TabSwitcherSkeleton'
import React from 'react'

const loading = () => {
  return (
    <div style={{ padding: 24 }}>
       <TabSwitcherSkeleton/>
       <TableSkeleton/>
    </div>
  )
}

export default loading