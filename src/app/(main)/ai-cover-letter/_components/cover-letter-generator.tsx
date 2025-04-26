"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CoverLetterSchema } from "@/schemas/CoverLetterSchema";
import useFetch from "@/hooks/useFetch";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { generateCoverLetter } from "../../../../../actions/cover-letter";

type CoverLetterFormData = z.infer<typeof CoverLetterSchema>;

export default function CoverLetterGenerator() {
  const router = useRouter();
  const { fn: generateLetterFn } = useFetch(generateCoverLetter);
  
  const form = useForm<CoverLetterFormData>({
    resolver: zodResolver(CoverLetterSchema),
    defaultValues: {
      jobTitle: "",
      companyName: "",
      jobDescription: ""
    }
  });

  const onSubmit = async (data: CoverLetterFormData) => {
    try {
      const result = await generateLetterFn(data);
      toast.success("Cover letter generated successfully!");
      router.push(`/ai-cover-letter/${result.userId}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to generate cover letter");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter job title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="jobDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Paste the job description here"
                      className="h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button 
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Cover Letter"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}