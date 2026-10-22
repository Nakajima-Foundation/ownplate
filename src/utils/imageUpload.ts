// アップロードを受け付けない理由。Storage のルール（storage.rules の
// isImageWithinLimit）と同じ条件で、送る前に弾く。
//
// 通してしまうと Storage が 403 を返し、保存全体が失敗する。画面に出るのは
// 「保存に失敗しました」だけなので、店舗オーナーには画像が原因だと分からない。

const bytesPerMegaByte = 1024 * 1024;

export const maxImageUploadMegaBytes = 5;
export const maxImageUploadBytes = maxImageUploadMegaBytes * bytesPerMegaByte;

export type ImageUploadRejection = "notImage" | "tooLarge";

// 画像かどうかも見る。入力欄の accept は画像しか選ばせないが、
// ドラッグ＆ドロップはそれを通らない。
export const imageUploadRejection = (file: {
  type: string;
  size: number;
}): ImageUploadRejection | null => {
  if (!file.type.startsWith("image/")) {
    return "notImage";
  }
  if (file.size > maxImageUploadBytes) {
    return "tooLarge";
  }
  return null;
};
