"use client";
import { useCallback } from "react";

export default function ResumePdfDownloadButton() {
  // PDF 다운로드(기존 방식)
  const handleDownloadPDF = useCallback(async () => {
    const element = document.getElementById("resume-print");
    if (element) {
      // 1. 일시적으로 보이게
      const prevDisplay = element.style.display;
      element.style.display = "block";

      await new Promise(resolve => setTimeout(resolve, 100)); // 렌더링 보장
      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf()
        .set({
          margin: 20,
          filename: 'resume.pdf',
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        })
        .from(element)
        .save();

      // 2. 다시 숨김
      element.style.display = prevDisplay;
    }
  }, []);

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button
        onClick={handleDownloadPDF}
        className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-base"
        type="button"
      >
        이력서 출력하기
      </button>
    </div>
  );
} 