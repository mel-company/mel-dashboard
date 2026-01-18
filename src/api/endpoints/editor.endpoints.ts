
import axiosInstance from "@/utils/AxiosInstance";

export const editorAPI = {
  /**
   * Serve a JSON file
   */
  serveJsonFile: async (): Promise<any> => {
    const { data } = await axiosInstance.get<any>("/editor/json-file", {
    });
    return data;
  },
}