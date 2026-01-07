import { Slate, Editable, useSlate, ReactEditor } from "slate-react";
import type { Descendant, BaseEditor } from "slate";
import { Editor, Transforms, Element as SlateElement } from "slate";
import { Button } from "../ui/button";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Underline,
} from "lucide-react";
import { cn } from "@/lib/utils";

type CustomEditor = BaseEditor & ReactEditor;

const TextEditor = ({
  editor,
  value,
  setValue,
}: {
  editor: CustomEditor;
  value: Descendant[];
  setValue: (value: Descendant[]) => void;
}) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Slate editor={editor} initialValue={value} onChange={setValue}>
        <Toolbar />
        <Editable
          dir="rtl"
          placeholder=""
          className="text-right h-[500px] min-h-[500px] py-4 px-8 focus:outline-none overflow-x-hidden overflow-y-scroll"
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={(event) => {
            // Handle Enter key
            if (event.key === "Enter") {
              const { selection } = editor;
              if (selection) {
                // Check if we're in a list item
                const [listItemMatch] = Array.from(
                  Editor.nodes(editor, {
                    at: selection,
                    match: (n) =>
                      !Editor.isEditor(n) &&
                      SlateElement.isElement(n) &&
                      n.type === "list-item",
                  })
                );

                if (listItemMatch) {
                  const [node] = listItemMatch;
                  const listItem = node as CustomElement;

                  // Check if the list item is empty (only contains empty text)
                  const isEmpty =
                    listItem.children.length === 1 &&
                    "text" in listItem.children[0] &&
                    listItem.children[0].text === "";

                  // Check if we're in an ordered or unordered list
                  const [listMatch] = Array.from(
                    Editor.nodes(editor, {
                      at: selection,
                      match: (n) =>
                        !Editor.isEditor(n) &&
                        SlateElement.isElement(n) &&
                        (n.type === "numbered-list" ||
                          n.type === "bulleted-list"),
                    })
                  );

                  if (listMatch) {
                    if (isEmpty) {
                      // If list item is empty, exit the list and create a paragraph
                      Transforms.unwrapNodes(editor, {
                        match: (n) =>
                          !Editor.isEditor(n) &&
                          SlateElement.isElement(n) &&
                          (n.type === "numbered-list" ||
                            n.type === "bulleted-list"),
                        split: true,
                      });
                      Transforms.setNodes(editor, { type: "paragraph" });
                      event.preventDefault();
                      return;
                    } else {
                      // Insert a new list item to continue the list
                      Transforms.insertNodes(editor, {
                        type: "list-item",
                        children: [{ text: "" }],
                      });
                      event.preventDefault();
                      return;
                    }
                  }
                }

                // Check if we're in a heading
                const [headingMatch] = Array.from(
                  Editor.nodes(editor, {
                    at: selection,
                    match: (n) =>
                      !Editor.isEditor(n) &&
                      SlateElement.isElement(n) &&
                      (n.type === "heading-one" ||
                        n.type === "heading-two" ||
                        n.type === "heading-three"),
                  })
                );

                if (headingMatch) {
                  const [node] = headingMatch;
                  const heading = node as CustomElement;

                  // Check if the heading is empty or cursor is at the end
                  const isEmpty =
                    heading.children.length === 1 &&
                    "text" in heading.children[0] &&
                    heading.children[0].text === "";

                  // Get the current text node to check cursor position
                  const { anchor } = selection;
                  const [textNode] = Editor.node(editor, anchor);

                  // Check if cursor is at the end of the text
                  const isAtEnd =
                    "text" in textNode &&
                    anchor.offset === (textNode.text as string).length;

                  if (isEmpty || isAtEnd) {
                    // Insert a new paragraph after the heading
                    Transforms.insertNodes(editor, {
                      type: "paragraph",
                      children: [{ text: "" }],
                    });
                    event.preventDefault();
                    return;
                  }
                }
              }
            }

            // Handle Backspace key to delete list items
            if (event.key === "Backspace") {
              const { selection } = editor;
              if (selection) {
                const { anchor } = selection;

                // Check if cursor is at the start of a list item
                if (anchor.offset === 0) {
                  const [listItemMatch] = Array.from(
                    Editor.nodes(editor, {
                      at: selection,
                      match: (n) =>
                        !Editor.isEditor(n) &&
                        SlateElement.isElement(n) &&
                        n.type === "list-item",
                    })
                  );

                  if (listItemMatch) {
                    const [node, path] = listItemMatch;
                    const listItem = node as CustomElement;

                    // Check if the list item is empty
                    const isEmpty =
                      listItem.children.length === 1 &&
                      "text" in listItem.children[0] &&
                      listItem.children[0].text === "";

                    // Check if this is the first element in the editor
                    // path[0] is the index in the editor's children array
                    const isFirstElement = path[0] === 0;

                    // Check if we're in a list
                    const [listMatch] = Array.from(
                      Editor.nodes(editor, {
                        at: selection,
                        match: (n) =>
                          !Editor.isEditor(n) &&
                          SlateElement.isElement(n) &&
                          (n.type === "numbered-list" ||
                            n.type === "bulleted-list"),
                      })
                    );

                    if (listMatch) {
                      if (isEmpty) {
                        // If list item is empty, convert to paragraph
                        Transforms.unwrapNodes(editor, {
                          match: (n) =>
                            !Editor.isEditor(n) &&
                            SlateElement.isElement(n) &&
                            (n.type === "numbered-list" ||
                              n.type === "bulleted-list"),
                          split: true,
                        });
                        Transforms.setNodes(editor, { type: "paragraph" });
                        event.preventDefault();
                        return;
                      } else if (isFirstElement) {
                        // If it's the first element and has content, allow normal deletion
                        // but if cursor is at start, convert to paragraph
                        Transforms.unwrapNodes(editor, {
                          match: (n) =>
                            !Editor.isEditor(n) &&
                            SlateElement.isElement(n) &&
                            (n.type === "numbered-list" ||
                              n.type === "bulleted-list"),
                          split: true,
                        });
                        Transforms.setNodes(editor, { type: "paragraph" });
                        event.preventDefault();
                        return;
                      }
                    }
                  }
                }
              }
            }

            // Handle keyboard shortcuts
            if (event.ctrlKey || event.metaKey) {
              switch (event.key) {
                case "b":
                  event.preventDefault();
                  toggleMark(editor, "bold");
                  break;
                case "i":
                  event.preventDefault();
                  toggleMark(editor, "italic");
                  break;
                case "u":
                  event.preventDefault();
                  toggleMark(editor, "underline");
                  break;
              }
            }
          }}
        />
      </Slate>
    </div>
  );
};

export default TextEditor;

// Custom types for our editor
type CustomElement = {
  type: string;
  align?: string;
  children: CustomText[];
};

type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
};

declare module "slate" {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

// Render different element types
const renderElement = (props: any) => {
  const { attributes, children, element } = props;
  const style = { textAlign: element.align || "right" };

  switch (element.type) {
    case "heading-one":
      return (
        <h1 {...attributes} style={style} className="text-3xl font-bold mb-2">
          {children}
        </h1>
      );
    case "heading-two":
      return (
        <h2 {...attributes} style={style} className="text-2xl font-bold mb-2">
          {children}
        </h2>
      );
    case "heading-three":
      return (
        <h3 {...attributes} style={style} className="text-xl font-bold mb-2">
          {children}
        </h3>
      );
    case "bulleted-list":
      return (
        <ul
          {...attributes}
          style={style}
          className="list-disc list-inside mb-2"
        >
          {children}
        </ul>
      );
    case "numbered-list":
      return (
        <ol
          {...attributes}
          style={style}
          className="list-decimal list-inside mb-2"
        >
          {children}
        </ol>
      );
    case "list-item":
      return (
        <li {...attributes} className="mb-1">
          {children}
        </li>
      );
    default:
      return (
        <p {...attributes} style={style} className="mb-2">
          {children}
        </p>
      );
  }
};

// Render text with marks
const renderLeaf = (props: any) => {
  const { attributes, children, leaf } = props;
  let text = children;

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

  return <span {...attributes}>{text}</span>;
};

// Helper function to toggle marks (used in both toolbar and keyboard shortcuts)
const toggleMark = (editor: CustomEditor, format: string) => {
  const isActive = isMarkActive(editor, format);
  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isMarkActive = (editor: CustomEditor, format: string) => {
  const { selection } = editor;
  if (!selection) return false;

  const marks = Editor.marks(editor);
  if (!marks) return false;

  // Check if the mark exists and is true
  const markValue = marks[format as keyof typeof marks];
  return markValue === true;
};

// Toolbar component with formatting functions
const Toolbar = () => {
  const editor = useSlate();

  // useSlate() automatically causes re-renders when editor state changes,
  // including selection changes. This ensures toolbar buttons highlight
  // correctly based on the current cursor position and active formatting.

  const isBlockActive = (format: string) => {
    const { selection } = editor;
    if (!selection) return false;

    // For list types, we need to check if we're inside a list-item that belongs to the list type
    if (format === "numbered-list" || format === "bulleted-list") {
      const [match] = Array.from(
        Editor.nodes(editor, {
          at: Editor.unhangRange(editor, selection),
          match: (n) =>
            !Editor.isEditor(n) &&
            SlateElement.isElement(n) &&
            n.type === format,
        })
      );
      return !!match;
    }

    const [match] = Array.from(
      Editor.nodes(editor, {
        at: Editor.unhangRange(editor, selection),
        match: (n) =>
          !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
      })
    );

    return !!match;
  };

  const toggleBlock = (format: string) => {
    const isActive = isBlockActive(format);
    const isList = format === "bulleted-list" || format === "numbered-list";

    // First, unwrap any existing lists
    Transforms.unwrapNodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        (n.type === "bulleted-list" || n.type === "numbered-list"),
      split: true,
    });

    let newProperties: Partial<CustomElement>;
    if (isActive) {
      // If already active, convert to paragraph
      newProperties = { type: "paragraph" };
      Transforms.setNodes<SlateElement>(editor, newProperties);
    } else if (isList) {
      // For lists, we need to wrap the current block in a list structure
      const { selection } = editor;
      if (selection) {
        // Get all block nodes in the selection
        const blocks = Array.from(
          Editor.nodes(editor, {
            at: selection,
            match: (n) =>
              !Editor.isEditor(n) &&
              SlateElement.isElement(n) &&
              Editor.isBlock(editor, n),
          })
        );

        if (blocks.length > 0) {
          // For each block, convert it to a list-item
          blocks.forEach(([, path]) => {
            // Convert block to list-item
            Transforms.setNodes<SlateElement>(
              editor,
              { type: "list-item" },
              { at: path }
            );
          });

          // Wrap all list-items in the list container
          const listElement: CustomElement = {
            type: format,
            children: [],
          };
          Transforms.wrapNodes(editor, listElement, {
            match: (n) =>
              !Editor.isEditor(n) &&
              SlateElement.isElement(n) &&
              n.type === "list-item",
          });
        } else {
          // If no blocks selected, convert current block to list-item and wrap
          Transforms.setNodes<SlateElement>(editor, { type: "list-item" });
          const listElement: CustomElement = {
            type: format,
            children: [],
          };
          Transforms.wrapNodes(editor, listElement, {
            match: (n) =>
              !Editor.isEditor(n) &&
              SlateElement.isElement(n) &&
              n.type === "list-item",
          });
        }
      }
    } else {
      // For non-list blocks (headings), just set the type
      newProperties = { type: format };
      Transforms.setNodes<SlateElement>(editor, newProperties);
    }
  };

  const toggleAlignment = (align: string) => {
    Transforms.setNodes(
      editor,
      { align },
      {
        match: (n) =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          Editor.isBlock(editor, n),
      }
    );
  };

  const isAlignmentActive = (align: string) => {
    const { selection } = editor;
    if (!selection) return false;

    const [match] = Array.from(
      Editor.nodes(editor, {
        at: Editor.unhangRange(editor, selection),
        match: (n) =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          Editor.isBlock(editor, n) &&
          (n as CustomElement).align === align,
      })
    );

    return !!match;
  };

  return (
    <div className="flex items-center gap-2 p-2 border-b bg-muted/50">
      {/* Heading */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0 bg-muted rounded-md border border-border">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0",
              isBlockActive("heading-one") &&
                "bg-primary text-primary-foreground"
            )}
            onClick={() => toggleBlock("heading-one")}
            type="button"
          >
            <Heading1 className="size-4" />
          </Button>
          <div className="w-px h-6 bg-border" />
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0",
              isBlockActive("heading-two") &&
                "bg-primary text-primary-foreground"
            )}
            onClick={() => toggleBlock("heading-two")}
            type="button"
          >
            <Heading2 className="size-4" />
          </Button>
          <div className="w-px h-6 bg-border" />
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0",
              isBlockActive("heading-three") &&
                "bg-primary text-primary-foreground"
            )}
            onClick={() => toggleBlock("heading-three")}
            type="button"
          >
            <Heading3 className="size-4" />
          </Button>
        </div>
      </div>

      {/* Formatting */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0 bg-muted rounded-md border border-border">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0",
              isMarkActive(editor, "bold") &&
                "bg-primary text-primary-foreground"
            )}
            onClick={() => toggleMark(editor, "bold")}
            type="button"
          >
            <Bold className="size-4" />
          </Button>
          <div className="w-px h-6 bg-border" />
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0",
              isMarkActive(editor, "italic") &&
                "bg-primary text-primary-foreground"
            )}
            onClick={() => toggleMark(editor, "italic")}
            type="button"
          >
            <Italic className="size-4" />
          </Button>
          <div className="w-px h-6 bg-border" />
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0",
              isMarkActive(editor, "underline") &&
                "bg-primary text-primary-foreground"
            )}
            onClick={() => toggleMark(editor, "underline")}
            type="button"
          >
            <Underline className="size-4" />
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0 bg-muted rounded-md border border-border">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0",
              isBlockActive("numbered-list") &&
                "bg-primary text-primary-foreground"
            )}
            onClick={() => toggleBlock("numbered-list")}
            type="button"
          >
            <ListOrdered className="size-4" />
          </Button>
          <div className="w-px h-6 bg-border" />
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0",
              isBlockActive("bulleted-list") &&
                "bg-primary text-primary-foreground"
            )}
            onClick={() => toggleBlock("bulleted-list")}
            type="button"
          >
            <List className="size-4" />
          </Button>
        </div>
      </div>

      {/* Align */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0 bg-muted rounded-md border border-border">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0",
              isAlignmentActive("right") && "bg-primary text-primary-foreground"
            )}
            onClick={() => toggleAlignment("right")}
            type="button"
          >
            <AlignRight className="size-4" />
          </Button>
          <div className="w-px h-6 bg-border" />
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0",
              isAlignmentActive("center") &&
                "bg-primary text-primary-foreground"
            )}
            onClick={() => toggleAlignment("center")}
            type="button"
          >
            <AlignCenter className="size-4" />
          </Button>
          <div className="w-px h-6 bg-border" />
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0",
              isAlignmentActive("left") && "bg-primary text-primary-foreground"
            )}
            onClick={() => toggleAlignment("left")}
            type="button"
          >
            <AlignLeft className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
