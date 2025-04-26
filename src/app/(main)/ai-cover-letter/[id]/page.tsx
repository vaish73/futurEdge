import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCoverLetter } from "../../../../../actions/cover-letter";
import CoverLetterPreview from "../_components/cover-letter-preview";
import { redirect } from "next/navigation";

// ✅ Define the type of the `params` prop based on Next.js dynamic routes
interface EditCoverLetterPageProps {
  params: {
    id: string;
  };
}

export default async function EditCoverLetterPage({
  params,
}: EditCoverLetterPageProps) {


  const { id } =  await params;
    // Defensive check
    if (!id || id === "new" || id === "undefined") {
      // Could also show a warning or a 404 UI
      return (
        <div className="container mx-auto py-6 text-center">
          <h1 className="text-2xl font-semibold">Invalid Cover Letter ID</h1>
          <p className="text-muted-foreground mt-2">Please select or create a new cover letter.</p>
          <Link href="/ai-cover-letter/new">
            <Button className="mt-4">Create New Cover Letter</Button>
          </Link>
        </div>
      );
    }


  try {
    const coverLetter = await getCoverLetter(id);

    if (!coverLetter) {
      return (
        <div className="container mx-auto py-6 text-center">
          <h1 className="text-2xl font-semibold">Cover Letter Not Found</h1>
          <p className="text-muted-foreground mt-2">The requested cover letter does not exist.</p>
          <Link href="/ai-cover-letter">
            <Button className="mt-4">Back to Cover Letters</Button>
          </Link>
        </div>
      );
    }
    
    return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-2">
        <Link href="/ai-cover-letter">
          <Button variant="link" className="gap-2 pl-0">
            <ArrowLeft className="h-4 w-4" />
            Back to Cover Letters
          </Button>
        </Link>

        <h1 className="text-6xl font-bold gradient-title mb-6">
          {coverLetter?.jobTitle} at {coverLetter?.companyName}
        </h1>
      </div>

      <CoverLetterPreview content={coverLetter?.content ?? ""} />
    </div>
  );
  } catch (error) {
    console.error("Failed to load cover letter:", error);
    redirect("/ai-cover-letter"); // fallback
  }


}
