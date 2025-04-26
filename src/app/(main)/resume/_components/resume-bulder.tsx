"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Download,
  Edit,
  Loader2,
  Monitor,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { generateAtsFeedback, saveResume } from "../../../../../actions/resume";
import { EntryForm } from "./entry-form";
import useFetch from "@/hooks/useFetch";
import { entriesToMarkdown } from "@/app/lib/helper";
import { resumeSchema } from "@/schemas/ResumeSchema";
import { z } from "zod";
import { useUser } from "@/hooks/useUser";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { IResume } from "@/models/Resume";

type ResumeFormValues = z.infer<typeof resumeSchema>;

interface ResumeBuilderProps {
  initialContent: string;

}

export default function ResumeBuilder({ initialContent }: ResumeBuilderProps) {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [previewContent, setPreviewContent] = useState<string>(initialContent);
  const user = useUser();
  const [resumeMode, setResumeMode] = useState<"preview" | "edit">("preview");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);


  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResumeFormValues>({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      contactInfo: {},
      summary: "",
      skills: "",
      experience: [],
      education: [],
      projects: [],
    },
  });

  // Fixing useFetch generics: Assuming saveResume returns a string and accepts a single string parameter.
  const {
    loading: isSaving,
    fn: saveResumeFn,
    data: saveResult,
    error: saveError,
  } = useFetch<IResume>(saveResume);

  const formValues = watch();

  // Memoize helper functions so they do not change every render.
  const getContactMarkdown = useCallback((): string => {
    const { contactInfo } = formValues;
    const parts: string[] = [];
    if (contactInfo?.email) parts.push(`📧 ${contactInfo.email}`);
    if (contactInfo?.mobile) parts.push(`📱 ${contactInfo.mobile}`);
    if (contactInfo?.linkedin)
      parts.push(`💼 [LinkedIn](${contactInfo.linkedin})`);
    if (contactInfo?.twitter)
      parts.push(`🐦 [Twitter](${contactInfo.twitter})`);

    return parts.length > 0
      ? `## <div align="center">${user?.name || "Your Name"}</div>\n\n<div align="center">\n\n${parts.join(
        " | "
      )}\n\n</div>`
      : "";
  }, [formValues, user.name]);

  const getCombinedContent = useCallback((): string => {
    const { summary, skills, experience, education, projects } = formValues;

    // Ensure each entry's endDate is a valid string.
    const fixEntries = (entries: any[]) =>
      entries.map((entry) => ({
        ...entry,
        endDate: entry.endDate ?? "",
      }));

    return [
      getContactMarkdown(),
      summary && `## Professional Summary\n\n${summary}`,
      skills && `## Skills\n\n${skills}`,
      entriesToMarkdown(fixEntries(experience), "Work Experience"),
      entriesToMarkdown(fixEntries(education), "Education"),
      entriesToMarkdown(fixEntries(projects), "Projects"),
    ]
      .filter(Boolean)
      .join("\n\n");
  }, [formValues, getContactMarkdown]);

  // When initialContent changes, set activeTab to preview.
  useEffect(() => {
    if (initialContent) setActiveTab("preview");
  }, [initialContent]);

  useEffect(() => {
    if (activeTab === "edit") {
      const newContent = getCombinedContent();
      setPreviewContent(newContent || initialContent);
    }
  }, [formValues, activeTab, getCombinedContent, initialContent]);

  useEffect(() => {
    if (saveResult && !isSaving) {
      toast.success("Resume saved successfully!");
    }
    if (saveError) {
      toast.error(saveError.message || "Failed to save resume");
    }
  }, [saveResult, saveError, isSaving]);


  const generatePDF = async () => {
    const element = document.getElementById("resume-pdf");

    if (!element) {
      console.error("Element #resume-pdf not found");
      toast.error("Resume container not found");
      return;
    }

    try {
      setIsGenerating(true);

      // Temporarily make the element visible for capture
      element.style.opacity = '1';
      element.style.zIndex = '9999';
      element.style.top = '0';
      element.style.left = '0';

      await new Promise((r) => setTimeout(r, 300));
      await document.fonts.ready;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#fff",
        logging: true,
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("resume.pdf");

      toast.success("PDF generated successfully 🎉");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsGenerating(false);
      // Hide the element again
      const element = document.getElementById("resume-pdf");
      if (element) {
        element.style.opacity = '0';
        element.style.zIndex = '-9999';
        element.style.top = '-9999px';
        element.style.left = '-9999px';
      }
    }
  };


  const onSubmit = async (data: ResumeFormValues): Promise<void> => {
    try {
      const formattedContent = previewContent
        .replace(/\n/g, "\n")
        .replace(/\n\s*\n/g, "\n\n")
        .trim();
      console.log(data);
      await saveResumeFn(formattedContent);
    } catch (error) {
      console.error("Save error:", error);
    }
  };


const handleGenerateAIReview = async () => {
  setIsGenerating(true);
  try {
    if (!user?.id) {
      throw new Error("Please sign in to generate feedback");
    }

    if (!previewContent.trim()) {
      throw new Error("Resume content is empty");
    }

    const result = await generateAtsFeedback(
      user.id,
      previewContent
    );
    
    toast.success("ATS feedback generated!");
    setAtsScore(result.atsScore);
    setFeedback(result.feedback);
    
  } catch (err: any) {
    toast.error(err.message || "Failed to generate feedback");
  } finally {
    setIsGenerating(false);
  }
};


  return (
    <div data-color-mode="light" className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-2">
        <h1 className="font-bold gradient-title text-5xl md:text-6xl">
          Resume Builder
        </h1>
        <div className="space-x-2">
          <Button
            variant="destructive"
            onClick={handleSubmit(onSubmit)}
            disabled={isSaving}
            className="bg-green-500"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save
              </>
            )}
          </Button>
          <Button onClick={generatePDF} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value: string) =>
          setActiveTab(value as "edit" | "preview")
        }
      >
        <TabsList>
          <TabsTrigger value="edit">Form</TabsTrigger>
          <TabsTrigger value="preview">Markdown</TabsTrigger>
        </TabsList>

        <TabsContent value="edit">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    {...register("contactInfo.email")}
                    type="email"
                    placeholder="your@email.com"
                  />
                  {errors.contactInfo?.email && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mobile Number</label>
                  <Input
                    {...register("contactInfo.mobile")}
                    type="tel"
                    placeholder="+1 234 567 8900"
                  />
                  {errors.contactInfo?.mobile && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.mobile.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">LinkedIn URL</label>
                  <Input
                    {...register("contactInfo.linkedin")}
                    type="url"
                    placeholder="https://linkedin.com/in/your-profile"
                  />
                  {errors.contactInfo?.linkedin && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.linkedin.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Twitter/X Profile
                  </label>
                  <Input
                    {...register("contactInfo.twitter")}
                    type="url"
                    placeholder="https://twitter.com/your-handle"
                  />
                  {errors.contactInfo?.twitter && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.twitter.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Professional Summary</h3>
              <Controller
                name="summary"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    className="h-32"
                    placeholder="Write a compelling professional summary..."
                  />
                )}
              />
              {errors.summary && (
                <p className="text-sm text-red-500">
                  {errors.summary.message}
                </p>
              )}
            </div>

            {/* Skills */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Skills</h3>
              <Controller
                name="skills"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    className="h-32"
                    placeholder="List your key skills..."
                  />
                )}
              />
              {errors.skills && (
                <p className="text-sm text-red-500">
                  {errors.skills.message}
                </p>
              )}
            </div>

            {/* Experience */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Work Experience</h3>
              <Controller
                name="experience"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Experience"
                    entries={field.value.map((entry: any) => ({
                      ...entry,
                      endDate: entry.endDate ?? "",
                    }))}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.experience && (
                <p className="text-sm text-red-500">
                  {errors.experience.message}
                </p>
              )}
            </div>

            {/* Education */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Education</h3>
              <Controller
                name="education"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Education"
                    entries={field.value.map((entry: any) => ({
                      ...entry,
                      endDate: entry.endDate ?? "",
                    }))}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.education && (
                <p className="text-sm text-red-500">
                  {errors.education.message}
                </p>
              )}
            </div>

            {/* Projects */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Projects</h3>
              <Controller
                name="projects"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Project"
                    entries={field.value.map((entry: any) => ({
                      ...entry,
                      endDate: entry.endDate ?? "",
                    }))}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.projects && (
                <p className="text-sm text-red-500">
                  {errors.projects.message}
                </p>
              )}
            </div>
          </form>
        </TabsContent>

        <TabsContent value="preview">
          {activeTab === "preview" && (
            <Button
              variant="link"
              type="button"
              className="mb-2"
              onClick={() =>
                setResumeMode(resumeMode === "preview" ? "edit" : "preview")
              }
            >
              {resumeMode === "preview" ? (
                <>
                  <Edit className="h-4 w-4" />
                  Edit Resume
                </>
              ) : (
                <>
                  <Monitor className="h-4 w-4" />
                  Show Preview
                </>
              )}
            </Button>
          )}

          {activeTab === "preview" && resumeMode !== "preview" && (
            <div className="flex p-3 gap-2 items-center border-2 border-yellow-600 text-yellow-600 rounded mb-2">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm">
                You will lose edited markdown if you update the form data.
              </span>
            </div>
          )}
          <div className="border rounded-lg">
            <MDEditor
              value={previewContent}
              onChange={(value) => {
                if (value !== undefined) setPreviewContent(value);
              }}
              height={800}
              preview={resumeMode}
            />
          </div>
          <div
            id="resume-pdf"
            className="fixed top-0  left-0 w-[100%] text-[10px] h-[370mm] bg-white p-6 scale-[1] z-[-9999] opacity-0 overflow-hidden"
            style={{
              position: 'fixed',
              top: '-9999px',
              left: '-9999px',
            }}
          >
            <MDEditor.Markdown
              source={previewContent}
              style={{
                background: "white",
                color: "black",
                width: '100%',
                height: '100%',
              }}
            />
          </div>
        </TabsContent>
        </Tabs>
        <div>
          <div className="p-4 mt-4 my-4 rounded-xl bg-gray-100 text-gray-800 text-md shadow-md">
            <h3 className="text-lg font-medium">📊 ATS Score: {atsScore ?? "Not generated"}</h3>
            <h4 className="text-lg font-medium mt-2">🧠 Feedback:</h4>
            <p className="text-gray-700 whitespace-pre-line">{feedback ?? "No feedback yet."}</p>
          </div>
          <Button 
            className="bg-green-600 text-white hover:bg-green-500" 
            onClick={handleGenerateAIReview}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Feedback...
              </>
            ) : (
              "Generate ATS Feedback"
            )}
          </Button>  
        </div>
    </div>
  );
}
