import { BarLoader } from "react-spinners";
import { Suspense } from "react";


function InterviewLayout({children}: Readonly<{
    children: React.ReactNode;
}>) {
  return (
    <div className="px-5">
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="gray" />}
      >
        {children}
      </Suspense>
    </div>
    )
}

export default InterviewLayout