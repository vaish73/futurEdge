"use server"

import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import dbConnect from "@/lib/dbConnect";
import AssessmentModel from "@/models/Assessment";
import ProfileModel from "@/models/Profile";
import { getServerSession } from "next-auth"
import { Profile } from '@/models/Profile'
import { Types } from "mongoose"; 

function serializeProfile(profile: Profile) {
    return {
        ...profile,
        userId: profile.userId instanceof Types.ObjectId ? profile.userId.toString() : profile.userId,
        _id: profile._id instanceof Types.ObjectId ? profile._id.toString() : profile._id,
    };
}

export async function completeOnboarding(data: {
    name: string;
    industry: string;
    skills: string[];
    experience: number;
    bio?: string;
}){
    await dbConnect()
    const session = await getServerSession(authOptions)
    console.log(session);
    
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
    ) as unknown as Profile | null;

    console.log(profile);
    await AssessmentModel.findOneAndUpdate(
        {userId: session.user.id},
        {category: data.industry},
        {upsert: true}
    )
    if(!profile) throw new Error("Profile creation failed");

    return serializeProfile(profile);
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
