import { useState, useMemo } from "react";
import { withReact } from "slate-react";
import { createEditor } from "slate";
import type { Descendant } from "slate";
import { withHistory } from "slate-history";
import TextEditor from "@/components/text-editor/TextEditor";

type Props = {};

const DemoUsageTextEditor = ({}: Props) => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  const [value, setValue] = useState<Descendant[]>([
    {
      type: "paragraph",
      children: [{ text: "اكتب سياسات المتجر هنا..." }],
    } as Descendant,
  ]);

  return <TextEditor editor={editor} value={value} setValue={setValue} />;
};

export default DemoUsageTextEditor;
