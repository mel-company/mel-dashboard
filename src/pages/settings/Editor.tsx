import { useServeJsonFile } from "@/api/wrappers/editor.wrappers";

type Props = {}

const Editor = ({}: Props) => {

    const { data: jsonFile, isLoading: isLoadingJsonFile } = useServeJsonFile();

    console.log(jsonFile);

  return (
    <div>Editor</div>
  )
}

export default Editor