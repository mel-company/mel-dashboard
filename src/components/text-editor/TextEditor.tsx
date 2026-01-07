import { Slate, Editable } from "slate-react";
import type { Descendant } from "slate";
import { Button } from "../ui/button";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  List,
  ListOrdered,
  Underline,
} from "lucide-react";

const TextEditor = ({
  editor,
  value,
  setValue,
}: {
  editor: any;
  value: Descendant[];
  setValue: (value: Descendant[]) => void;
}) => {
  //   const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  //   const [value, setValue] = useState<Descendant[]>([
  //     {
  //       type: "paragraph",
  //       children: [{ text: "اكتب سياسات المتجر هنا..." }],
  //     } as Descendant,
  //   ]);

  return (
    <Slate editor={editor} initialValue={value} onChange={setValue}>
      <Toolbar />
      <Editable
        dir="rtl"
        placeholder="اكتب هنا..."
        className="text-right min-h-[100px] bg- rounded-md p-2"
      />
    </Slate>
  );
};

export default TextEditor;

const Toolbar = () => {
  return (
    <div className="flex items-center gap-2">
      {/* Formatting */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-muted rounded-md">
          <Button variant="ghost">
            <Bold />
          </Button>
          <div className="w-[2px] rounded-full  h-[20px] self-center bg-muted-foreground" />
          <Button variant="ghost">
            <Italic />
          </Button>
          <div className="w-[2px] rounded-full  h-[20px] self-center bg-muted-foreground" />
          <Button variant="ghost">
            <Underline />
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-muted rounded-md">
          <Button variant="ghost">
            <ListOrdered />
          </Button>
          <div className="w-[2px] rounded-full  h-[20px] self-center bg-muted-foreground" />
          <Button variant="ghost">
            <List />
          </Button>
        </div>
      </div>

      {/* Align */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-muted rounded-md">
          <Button variant="ghost">
            <AlignRight />
          </Button>
          <div className="w-[2px] rounded-full  h-[20px] self-center bg-muted-foreground" />
          <Button variant="ghost">
            <AlignCenter />
          </Button>
          <div className="w-[2px] rounded-full  h-[20px] self-center bg-muted-foreground" />
          <Button variant="ghost">
            <AlignLeft />
          </Button>
        </div>
      </div>
    </div>
  );
};
