import { useQuery } from "@tanstack/react-query";
import { editorAPI } from "../endpoints/editor.endpoints";

/**
 * Query key factory for editor
 */
export const editorKeys = {
  all: ["editor"] as const,
  lists: () => [...editorKeys.all, "list"] as const,
  list: () => [...editorKeys.lists()] as const,
  serveJsonFile: () => [...editorKeys.lists(), "serveJsonFile"] as const,
};

/**
 * Serve a JSON file
 */
export const useServeJsonFile = () => {
  return useQuery<any>({
    queryKey: editorKeys.serveJsonFile(),
    queryFn: () => editorAPI.serveJsonFile(),
  });
};