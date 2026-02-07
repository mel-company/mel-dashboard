import React from "react";
import type { Descendant } from "slate";



// Render different element types
const renderElement = (element: any, index: number) => {
  const style = { textAlign: element.align || "right" };
   
  switch (element.type) {
    case "heading-one":
      return (
        <h1 key={index} style={style} className="text-3xl font-bold mb-2">
          {renderChildren(element.children)}
        </h1>
      );
    case "heading-two":
      return (
        <h2 key={index} style={style} className="text-2xl font-bold mb-2">
          {renderChildren(element.children)}
        </h2>
      );
    case "heading-three":
      return (
        <h3 key={index} style={style} className="text-xl font-bold mb-2">
          {renderChildren(element.children)}
        </h3>
      );
    case "bulleted-list":
      return (
        <ul key={index} style={style} className="list-disc list-inside mb-2">
          {renderChildren(element.children)}
        </ul>
      );
    case "numbered-list":
      return (
        <ol key={index} style={style} className="list-decimal list-inside mb-2">
          {renderChildren(element.children)}
        </ol>
      );
    case "list-item":
      return (
        <li key={index} className="mb-1">
          {renderChildren(element.children)}
        </li>
      );
    default:
      return (
        <p key={index} style={style} className="mb-2">
          {renderChildren(element.children)}
        </p>
      );
  }
};

// Render text with marks
const renderLeaf = (leaf: any, index: number) => {
  let text: React.ReactNode = leaf.text || "";

  // Apply formatting - order matters for nested formatting
  // Apply underline first (outermost), then italic, then bold (innermost)
  if (leaf.underline) {
    text = <u>{text}</u>;
  }
  if (leaf.italic) {
    text = <em>{text}</em>;
  }
  if (leaf.bold) {
    text = <strong>{text}</strong>;
  }

  return <span key={index}>{text}</span>;
};

// Render children recursively
const renderChildren = (children: any[]): React.ReactNode => {
  if (!children || children.length === 0) return null;

  return children.map((child, index) => {
    if (child.type) {
      // It's an element
      return renderElement(child, index);
    } else {
      // It's a text node
      return renderLeaf(child, index);
    }
  });
};

type Props = {
  content: Descendant[];
  className?: string;
};

const SlateContentRenderer = ({ content, className = "" }: Props) => {
  if (!content || content.length === 0) {
    return (
      <div className={`text-muted-foreground text-sm ${className}`}>
        لا يوجد محتوى
      </div>
    );
  }

  return (
    <div className={`text-right space-y-2 ${className}`}>
      {content.map((element, index) => renderElement(element, index))}
    </div>
  );
};

export default SlateContentRenderer;

