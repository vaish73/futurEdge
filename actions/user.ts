"use server"

import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import dbConnect from "@/lib/dbConnect";
import AssessmentModel from "@/models/Assessment";
import ProfileModel from "@/models/Profile";
import { getServerSession } from "next-auth"
import { Profile } from '@/models/Profile'


export async function completeOnboarding(data: {
    name: string;
    industry: string;
    skills: string[];
    experience: number;
    bio?: string;
}){
    await dbConnect()
    const session = await getServerSession(authOptions)
    if(!session?.user?.id) throw new Error("Unauthorized");

    const profile = await ProfileModel.findOneAndUpdate(
        {userId: session.user.id},
        {
            name: data.name || "",
            imageUrl: session.user.image || "",
            industry: data.industry,
            skills: data.skills,
            experience: data.experience,
            bio: data.bio
        },
        {upsert: true, new: true, lean: true}
    )
    console.log(profile);
    await AssessmentModel.findOneAndUpdate(
        {id: session.user.id},
        {category: data.industry},
        {upsert: true}
    )
    return profile;
}


export async function getUserOnboardingStatus(userId: string) {
    await dbConnect()
    const profile = await ProfileModel.findOne({userId}).lean() as Profile | null;
    console.log(profile)
    return {
        isOnboarded: !!profile?.industry,
        profileExists: profile || null
    };
}
