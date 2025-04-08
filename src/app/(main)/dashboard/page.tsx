// app/(main)/dashboard/page.tsx
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { getUserOnboardingStatus } from '../../../../actions/user';
import { getIndustryInsights } from '../../../../actions/dashboard';
import DashboardView from './_components/dashboard-view';
import { sanitizeMongoDoc } from '@/lib/sanitize';

interface SanitizedInsights {
  salaryRanges: Array<{
    role: string;
    min: number;
    max: number;
    median: number;
    location: string;
  }>;
  growthRate: number;
  demandLevel: string;
  topSkills: string[];
  marketOutlook: string;
  keyTrends: string[];
  recommendedSkills: string[];
  updatedAt: string;
  nextUpdate: string;
}

const IndustryInsightsPage = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/sign-in");

  const { isOnboarded } = await getUserOnboardingStatus(session.user.id);
  if (!isOnboarded) redirect("/onboarding");

  const insights = await getIndustryInsights();
  const sanitizedInsights = sanitizeMongoDoc(insights) as SanitizedInsights;

  return (
    <div>
      <DashboardView insights={sanitizedInsights} />
    </div>
  );
};

export default IndustryInsightsPage;