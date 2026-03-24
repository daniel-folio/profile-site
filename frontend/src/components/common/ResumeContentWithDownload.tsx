export default function ResumeContentWithDownload({
  children,
  downloadButton,
}: {
  children: React.ReactNode;
  downloadButton?: React.ReactNode;
}) {
  return (
    <>
      {/* <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white flex items-center gap-4">
        이력서 (Resume)
        {downloadButton}
      </h1> */}
      <div id="resume-content">{children}</div>
    </>
  );
} 