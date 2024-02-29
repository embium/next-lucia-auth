import MarkdownComponent from "./markdown";

export const PostPreview = ({ text }: { text: string }) => {
  return <MarkdownComponent body={text} />;
};
