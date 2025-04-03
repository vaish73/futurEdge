import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import React from 'react'
import { getUserOnboardingStatus } from '../../../../actions/user';

const Dashboard = async() => {
      const session = await getServerSession(authOptions)
      if (!session?.user) redirect("/sign-in")
  
      const { isOnboarded } = await getUserOnboardingStatus(session.user.id);
      if (!isOnboarded) redirect("/onboarding");

      
  return (
    <div>page</div>
  )
}

export default Dashboard