import type { Metadata } from "next";

import { PostEditorPage } from "@/components/post/post-editor-page";

export const metadata: Metadata = {
  title: "Create Post",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NewPostRoutePage() {
  return <PostEditorPage />;
}
