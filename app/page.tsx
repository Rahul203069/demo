"use client"
import {useRouter} from 'next/navigation'
import React from 'react'
import { Button } from './components/ui/button'

const page = () => {
  const router=useRouter()
  return (
    <div>page
      <Button onClick={()=>{router.push('/2feee7b7-629e-43c3-901c-8fa507a135f1&seller')}}></Button>
    </div>
  )
}

export default page