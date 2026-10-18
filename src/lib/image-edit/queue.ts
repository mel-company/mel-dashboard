/**
 * The queue between an image input and the image-editor modal.
 *
 * Every image input in the dashboard (product photos, category and group
 * images, discount images, the logo, the favicon, variant images) wraps its
 * `onChange` in `withImageEditor`. Picked files go to the modal first and the
 * original handler receives the edited ones — so each form keeps its own
 * validation, preview and upload code unchanged.
 *
 * The modal is mounted once in `App` and reads the current request from here.
 * The dashboard has no zustand, so this is a tiny store for
 * `useSyncExternalStore`.
 *
 * `editImage` resolves with:
 *   - the edited file, when the merchant saves;
 *   - the original file, when they skip editing, when the file is a kind the
 *     modal does not edit (SVG, GIF), when no modal is mounted, or on a phone;
 *   - `null`, when they cancel.
 */
import type React from "react";
import { isEditableImage } from "./render.ts";

export type EditRequest = {
  file: File;
  /** "2 / 3" when several files were picked at once. */
  position: { index: number; total: number } | null;
  resolve: (file: File | null) => void;
};

let request: EditRequest | null = null;
let hostMounted = false;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());

export const imageEditorStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getRequest: () => request,
  setHostMounted(mounted: boolean) {
    hostMounted = mounted;
  },
  finish(file: File | null) {
    const current = request;
    request = null;
    emit();
    current?.resolve(file);
  },
};

/**
 * Phones upload straight away (Ali, 2026-10-18): on a small touch screen the
 * modal is one step too many. Phone width, or a phone held sideways.
 */
const PHONE_QUERY = "(max-width: 767px), (pointer: coarse) and (max-height: 500px)";

const isPhone = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia(PHONE_QUERY).matches;

export const editImage = (
  file: File,
  position: EditRequest["position"] = null,
): Promise<File | null> => {
  if (!hostMounted || !isEditableImage(file) || isPhone()) return Promise.resolve(file);
  // A second pick while the modal is open replaces the first; the first
  // caller is told it was cancelled rather than left waiting forever.
  request?.resolve(null);
  return new Promise((resolve) => {
    request = { file, position, resolve };
    emit();
  });
};

/**
 * Edits each file in turn. Cancelling one drops only that file; the rest of
 * the batch carries on.
 */
export const editImages = async (files: File[]): Promise<File[]> => {
  const out: File[] = [];
  for (let i = 0; i < files.length; i++) {
    const position = files.length > 1 ? { index: i + 1, total: files.length } : null;
    const edited = await editImage(files[i], position);
    if (edited) out.push(edited);
  }
  return out;
};

const toFileList = (files: File[]): FileList => {
  const transfer = new DataTransfer();
  files.forEach((file) => transfer.items.add(file));
  return transfer.files;
};

/**
 * Wraps an `<input type=file>` change handler so the picked images pass
 * through the editor first. The handler gets an event-shaped object whose
 * `target.files` holds the edited files; it is not called at all when every
 * file was cancelled.
 *
 * The real input is cleared straight away, so picking the same file again
 * after a cancel still fires a change.
 */
export const withImageEditor =
  (handler: (event: React.ChangeEvent<HTMLInputElement>) => void) =>
  (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const picked = Array.from(input.files ?? []);
    input.value = "";
    if (!picked.length) return;
    void editImages(picked).then((files) => {
      if (!files.length) return;
      const list = toFileList(files);
      const target = { files: list, value: "", name: input.name, id: input.id, multiple: input.multiple };
      handler({
        ...event,
        target,
        currentTarget: target,
      } as unknown as React.ChangeEvent<HTMLInputElement>);
    });
  };
