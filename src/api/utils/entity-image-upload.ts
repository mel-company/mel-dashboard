import axiosInstance from "@/utils/AxiosInstance";

const IMAGE_UPLOAD_TIMEOUT_MS = 60_000;

export async function uploadEntityImage(
  path: string,
  image: File,
  fieldName = "image",
): Promise<any> {
  const formData = new FormData();
  formData.append(fieldName, image);
  const { data } = await axiosInstance.put(path, formData, {
    timeout: IMAGE_UPLOAD_TIMEOUT_MS,
  });
  return data;
}
