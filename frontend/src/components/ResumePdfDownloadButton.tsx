"use client";
import { useCallback } from "react";
import { FaPrint } from 'react-icons/fa';

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

  function handlePrintOrDownload() {
    const printDiv = document.getElementById('resume-print');
    if (!printDiv) return;
    printDiv.style.display = 'block';

    const img = printDiv.querySelector('img');
    if (img && img.src.startsWith('data:image/')) {
      if (!img.complete) {
        img.onload = () => {
          handleDownloadPDF();
        };
      } else {
        handleDownloadPDF();
      }
    } else {
      // 사진이 없거나 Base64 변환 실패
      handleDownloadPDF();
    }
  }

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button
        onClick={handlePrintOrDownload}
        className="ml-4 px-5 py-2 bg-gradient-to-r from-primary-gradient-start to-primary-gradient-end text-white rounded-full shadow-md hover:from-primary-gradient-end hover:to-primary-gradient-start focus:outline-none focus:ring-2 focus:ring-primary-gradient-start transition-all text-base flex items-center gap-2"
        type="button"
      >
        <FaPrint /> 이력서 다운로드
      </button>
    </div>
  );
} 