import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { RichTextContent } from "../client/src/components/RichTextContent";

describe("RichTextContent", () => {
  it("renders markdown formatting and preserves single line breaks", () => {
    const html = renderToStaticMarkup(
      React.createElement(RichTextContent, {
        content: "**Bold**\nSecond line",
      }),
    );

    expect(html).toContain("<strong>Bold</strong>");
    expect(html).toContain("<br");
  });

  it("strips unsafe html and unsafe link protocols", () => {
    const html = renderToStaticMarkup(
      React.createElement(RichTextContent, {
        content:
          '<script>alert(1)</script><a href="javascript:alert(1)">unsafe</a><a href="https://example.com">ok</a>',
      }),
    );

    expect(html).not.toContain("<script");
    expect(html).not.toContain("javascript:alert");
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('rel="noopener noreferrer nofollow"');
  });
});
