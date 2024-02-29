import Markdown, { type Components } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialOceanic } from "react-syntax-highlighter/dist/cjs/styles/prism";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

export default function MarkdownComponent({ body }: { body: string }) {
  const options: Components = {
    code: (props) => (
      <SyntaxHighlighter
        language={props.className?.replace(/(?:lang(?:uage)?-)/, "")}
        style={materialOceanic}
        wrapLines={true}
        className="not-prose rounded-md"
      >
        {String(props.children)}
      </SyntaxHighlighter>
    ),
  };

  const allowedTags = [
    "a",
    "article",
    "b",
    "blockquote",
    "br",
    "caption",
    "code",
    "del",
    "details",
    "div",
    "em",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "hr",
    "i",
    "img",
    "ins",
    "kbd",
    "li",
    "main",
    "ol",
    "p",
    "pre",
    "section",
    "span",
    "strike",
    "strong",
    "sub",
    "summary",
    "sup",
    "table",
    "tbody",
    "td",
    "th",
    "thead",
    "tr",
    "u",
    "ul",
    "iframe",
  ];

  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[
        rehypeRaw,
        [
          rehypeSanitize,
          {
            attributes: {
              iframe: ["src", "title", "width", "height"],
              a: ["href", "name", "target"],
              img: ["src"],
            },
            tagNames: allowedTags,
          },
        ],
      ]}
      components={options}
    >
      {body}
    </Markdown>
  );
}
