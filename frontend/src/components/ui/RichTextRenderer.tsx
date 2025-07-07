"use client";
import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import 'highlight.js/styles/github.css';

interface RichTextRendererProps {
  text?: string | null;
  className?: string;
}

export function RichTextRenderer({ text, className }: RichTextRendererProps) {
  if (!text) return null;
  // prose 클래스는 항상 적용 (겹치지 않게 병합)
  // 코드블록은 Tailwind로 다크모드 스타일 조정
  // 마진을 더 줄여서 글자 아래위 간격을 더욱 촘촘하게 함
  // 본문 내용은 들여쓰기(pl-4)로 제목과 시각적으로 구분
  let mergedClassName = className?.includes('prose') ? className : `prose dark:prose-invert max-w-none prose-p:my-0 prose-li:my-0 prose-blockquote:my-0.5 prose-h1:mb-1 prose-h2:mb-0.5 prose-h3:mb-0.5 prose-h4:mb-0 prose-h5:mb-0 prose-h6:mb-0 prose-pre:bg-gray-900 prose-pre:text-white dark:prose-pre:!bg-[#23272e] dark:prose-pre:!text-white ${className ?? ''}`;
  if (className?.includes('no-indent')) {
    mergedClassName = mergedClassName.replace(/pl-4|md:pl-6/g, '').replace(/\s+/g, ' ');
  }
  return (
    <div className={mergedClassName}>
      <ReactMarkdown
        children={text}
        remarkPlugins={[[remarkGfm, { singleTilde: false, breaks: true }], remarkBreaks]}
        rehypePlugins={[
          rehypeRaw,        // 마크다운 내 HTML 태그도 렌더링
          rehypeSanitize,   // XSS 방지
          rehypeHighlight,  // 코드블록 하이라이트
        ]}
        skipHtml={false}
        components={{
          a: (props) => <a {...props} target="_blank" rel="noopener noreferrer" />,
          u: (props) => <u style={{ textDecoration: 'underline', textDecorationThickness: '2px' }} {...props} />,
        }}
      />
    </div>
  );
} 