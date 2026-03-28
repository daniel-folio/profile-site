"use client";
import { useCallback } from "react";
import { FaPrint } from 'react-icons/fa';

export default function CareerDetailPdfDownloadButton() {
  const handleDownloadPDF = useCallback(async () => {
    const element = document.getElementById("career-detail-print");
    if (element) {
      const prevDisplay = element.style.display;
      element.style.display = "block";
      await new Promise(resolve => setTimeout(resolve, 100));
      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf()
        .set({
          margin: 20,
          filename: 'career-detail.pdf',
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        })
        .from(element)
        .save();
      element.style.display = prevDisplay;
    }
  }, []);

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button
        onClick={handleDownloadPDF}
        className="ml-4 px-5 py-2 bg-gradient-to-r from-primary-gradient-start to-primary-gradient-end text-white rounded-full shadow-md hover:from-primary-gradient-end hover:to-primary-gradient-start focus:outline-none focus:ring-2 focus:ring-primary-gradient-start transition-all text-base flex items-center gap-2"
        type="button"
      >
        <FaPrint />
        <span className="hidden sm:inline">경력기술서 다운로드</span>
        <span className="inline sm:hidden">다운로드</span>
      </button>
    </div>
  );
} 