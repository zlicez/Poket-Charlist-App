import React from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, {
  defaultSchema,
  type Options as SanitizeSchema,
} from "rehype-sanitize";

import { cn } from "@/lib/utils";

const RICH_TEXT_SANITIZE_SCHEMA: SanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    "a",
    "blockquote",
    "br",
    "code",
    "del",
    "em",
    "h1",
    "h2",
    "h3",
    "h4",
    "hr",
    "li",
    "ol",
    "p",
    "pre",
    "strong",
    "ul",
  ],
  attributes: {
    ...defaultSchema.attributes,
    a: ["href", "title"],
    code: [["className", /^language-/]],
  },
  protocols: {
    ...defaultSchema.protocols,
    href: ["http", "https", "mailto", "tel"],
  },
  strip: ["audio", "form", "iframe", "script", "style", "table", "video"],
};

const markdownComponents: Components = {
  a: ({ href, children, ...props }) => {
    if (!href) {
      return <span>{children}</span>;
    }

    return (
      <a
        {...props}
        href={href}
        target="_blank"
        rel="noopener noreferrer nofollow"
      >
        {children}
      </a>
    );
  },
};

interface RichTextContentProps {
  content?: string | null;
  className?: string;
  emptyState?: string;
  testId?: string;
}

export function RichTextContent({
  content,
  className,
  emptyState,
  testId,
}: RichTextContentProps) {
  const normalizedContent = content?.trim() ?? "";

  if (!normalizedContent) {
    return emptyState ? (
      <div className={cn("tx-l4", className)} data-testid={testId}>
        {emptyState}
      </div>
    ) : null;
  }

  return (
    <div className={cn("rich-content", className)} data-testid={testId}>
      <ReactMarkdown
        components={markdownComponents}
        remarkPlugins={[remarkGfm, remarkBreaks]}
        remarkRehypeOptions={{ allowDangerousHtml: true }}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, RICH_TEXT_SANITIZE_SCHEMA]]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
