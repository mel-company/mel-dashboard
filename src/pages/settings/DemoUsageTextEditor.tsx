import { useMemo, useEffect, useState } from "react";
import { withReact } from "slate-react";
import { createEditor } from "slate";
import type { Descendant } from "slate";
import { withHistory } from "slate-history";
import TextEditor from "@/components/text-editor/TextEditor";

type Props = {
  value?: Descendant[];
  onChange?: (value: Descendant[]) => void;
};

const DemoUsageTextEditor = ({ value, onChange }: Props) => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  const defaultValue: Descendant[] = [
    {
      type: "paragraph",
      children: [{ text: "اكتب سياسات المتجر هنا..." }],
    } as Descendant,
  ];

  const [editorValue, setEditorValue] = useState<Descendant[]>(
    value || defaultValue
  );

  // Update editor value when prop value changes
  useEffect(() => {
    if (value) {
      setEditorValue(value);
    }
  }, [value]);

  const handleChange = (newValue: Descendant[]) => {
    setEditorValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <TextEditor editor={editor} value={editorValue} setValue={handleChange} />
  );
};

export default DemoUsageTextEditor;
