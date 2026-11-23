// Toolbar control that inserts an image from the media library, with an
// uploader for adding new images without leaving the editor.
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ImagePlusIcon, ImageUpIcon } from "lucide-react";
import { useId, useState } from "react";
import Button from "../_ui/Button";
import Dialog from "../_ui/Dialog";
import type { MediaItem } from "../media/MediaLibraryItem";
import { MediaPickerLibrary } from "../media/MediaPickerLibrary";
import {
  MediaUploader,
  type UploadActivity,
  uploadActivityLabel,
} from "../media/MediaUploader";
import { INSERT_IMAGE_COMMAND } from "./imageCommands";
import { useMediaViewStore } from "./mediaViewStore";

interface ImagePickerProps {
  disabled?: boolean;
  /** Classes for the toolbar button. */
  className?: string;
}

export function ImagePicker({ disabled, className }: ImagePickerProps) {
  const [editor] = useLexicalComposerContext();
  const store = useMediaViewStore();
  const uploader_id = useId();
  const [is_open, set_is_open] = useState(false);
  // From the latest library load; null until one loads.
  const [can_upload, set_can_upload] = useState<boolean | null>(null);
  // Once opened, the uploader stays mounted (hidden when toggled off, or with
  // the dialog closed) so uploads keep going.
  const [has_uploader, set_has_uploader] = useState(false);
  const [is_uploader_shown, set_is_uploader_shown] = useState(false);
  const [activity, set_activity] = useState<UploadActivity>({
    in_progress: 0,
    failed: 0,
  });
  const [reload, set_reload] = useState(0);
  const activity_label = uploadActivityLabel(activity);

  const insert = (item: MediaItem) => {
    store.prime([item]);
    set_is_open(false);
    // The editor keeps its last selection while the dialog has focus.
    editor.dispatchCommand(INSERT_IMAGE_COMMAND, item.id);
    // After the closing dialog hands focus back to the toolbar button.
    requestAnimationFrame(() => editor.focus());
  };

  const toggle_uploader = () => {
    set_has_uploader(true);
    set_is_uploader_shown((shown) => !shown);
  };

  return (
    <>
      <Button
        size="icon"
        className={className}
        aria-label="Insert image"
        title={activity_label ? `Insert image (${activity_label})` : "Insert image"}
        aria-haspopup="dialog"
        disabled={disabled}
        onClick={() => set_is_open(true)}
      >
        <ImagePlusIcon strokeWidth={1.5} size={16} aria-hidden />
      </Button>
      <Dialog.Root open={is_open} onOpenChange={set_is_open}>
        <Dialog.Content className="max-w-3xl gap-4">
          <div className="-mx-2 px-2 pb-2 pr-12 border-b flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-2xl font-bold">Insert Image</h2>
              <p className="text-sm opacity-80">
                Its alt text and caption come from the library.
              </p>
            </div>
            {can_upload && (
              <div className="flex flex-wrap items-center gap-2">
                {activity_label && (
                  <p className="text-sm opacity-80" aria-live="polite">
                    {activity_label}
                  </p>
                )}
                <Button
                  aria-expanded={is_uploader_shown}
                  aria-controls={has_uploader ? uploader_id : undefined}
                  onClick={toggle_uploader}
                >
                  <ImageUpIcon strokeWidth={1.5} size={16} aria-hidden />
                  {is_uploader_shown ? "Hide uploader" : "Upload images"}
                </Button>
              </div>
            )}
          </div>
          {has_uploader && can_upload !== null && (
            <div
              id={uploader_id}
              hidden={!is_uploader_shown}
              className="px-2 pb-4 border-b border-neutral-700"
            >
              <MediaUploader
                disabled={!can_upload}
                on_uploaded={async (item) => {
                  store.prime([item]);
                  set_reload((count) => count + 1);
                }}
                on_activity_change={set_activity}
              />
            </div>
          )}
          <div className="pb-2">
            {is_open && (
              <MediaPickerLibrary
                on_pick={insert}
                action="Insert"
                on_loaded={(library) => set_can_upload(library.setup.can_upload)}
                reload={reload}
              />
            )}
          </div>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}
