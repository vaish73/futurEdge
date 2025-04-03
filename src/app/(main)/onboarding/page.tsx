import { getServerSession } from "next-auth"
import OnboardingForm from "./_components/onboarding-form"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import { redirect } from "next/navigation"
import { getUserOnboardingStatus } from "../../../../actions/user"

const OnboardingPage = async () => {
    const session = await getServerSession(authOptions)
    if (!session?.user) redirect("/sign-in")

    const { isOnboarded } = await getUserOnboardingStatus(session.user.id);
    if (isOnboarded) redirect("/dashboard");

    return (
        <>
            <div className="max-w-2xl mx-auto p-6">
                <h1 className="text-3xl font-bold mb-6">Career Profile Setup</h1>
                <p className="mb-8 text-gray-600">
                    Complete your profile to unlock AI-generated career insights,
                    resume suggestions, and personalized quizzes.
                </p>
                <OnboardingForm userId={session.user.id} />
            </div>
        </>
    )
}

export default OnboardingPage

