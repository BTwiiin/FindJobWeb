import EmptyFilter from '@/app/components/EmptyFilter'
import React from 'react'

export default async function SignIn(props: {searchParams: Promise<{callbackUrl: string}>}) {
  const searchParams = await props.searchParams;
  return (
    <div>
        <EmptyFilter
            title='You need to be logged in to do that'
            subtitle='Please click below to login'
            showLogin
            callbackUrl={searchParams.callbackUrl} />
      
    </div>
  )
}
