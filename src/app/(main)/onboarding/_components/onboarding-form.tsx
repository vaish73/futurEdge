"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { completeOnboarding } from "../../../../../actions/user"
import { industries } from '../../../../../data/industries';

interface onBoardingFormProps{
    userId: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function OnboardingForm({userId}:onBoardingFormProps) {
    const router = useRouter()
    const [formData, setFormData] = useState({
        name: "",
        industry: "Technology",
        skills: [] as string[],
        experience: 0,
        bio: ""
    });
    

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await completeOnboarding({
                ...formData,
                skills: formData.skills.filter(skill => skill.trim() !== "")
            })
            router.push("/dashboard")
        } catch (error) {
            console.error("Onboarding failed:", error);
            alert("Onboarding failed. Please try again")
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block mb-2">Name</label>
                <textarea
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 border rounded"
                />
            </div>
            <div>
                <label className="block mb-2">Industry</label>
                <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                >
                    {industries.map((ind) => {
                        return <option key={ind.id} value={ind.id}>
                            {ind.name}
                        </option>
                    })}
                    
                </select>
            </div>

            <div>
                <label className="block mb-2">Skills (comma separated)</label>
                <input
                    type="text"
                    value={formData.skills.join(", ")}
                    onChange={(e) => setFormData({
                        ...formData,
                        skills: e.target.value.split(",").map(s => s.trim())
                    })}
                    className="w-full p-2 border rounded"
                    required
                />
            </div>

            <div>
                <label className="block mb-2">Years of Experience</label>
                <input
                    type="number"
                    min="0"
                    value={formData.experience}
                    onChange={(e) => setFormData({
                        ...formData,
                        experience: parseInt(e.target.value) || 0
                    })}
                    className="w-full p-2 border rounded"
                    required
                />
            </div>

            <div>
                <label className="block mb-2">Professional Bio</label>
                <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full p-2 border rounded"
                    rows={4}
                />
            </div>
            <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
                Complete Setup
            </button>
        </form>
    )
}

export default OnboardingForm