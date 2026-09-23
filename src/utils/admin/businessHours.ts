import { isNull } from "@/utils/commonUtils";

// 営業時間の1枠。画面の時刻選択は空欄を選ぶと項目ごと消すので、片方だけ入っている形も
// 枠そのものが無い形も来る。型を実態に合わせてあるので、試験からその形を渡せる。
export type OpenTimeSlot =
  { start?: number | null; end?: number | null } | null | undefined;

// 1日分の文句を、昼の部・夜の部の順で返す。夜の部は任意なので、無くても何も言わない。
// 休業日は時間を見ない（見ると、閉めている曜日の空欄で保存が止まる）。
export const businessHoursErrors = (
  isOpen: boolean,
  slots: OpenTimeSlot[] | undefined,
): string[][] =>
  [0, 1].map((index) => {
    if (!isOpen) {
      return [];
    }
    const slot = slots && slots[index];
    if (!slot) {
      return index === 0 ? ["validationError.noSelect"] : [];
    }
    const errors: string[] = [];
    if (isNull(slot.start) !== isNull(slot.end)) {
      errors.push("validationError.oneInEmpty");
    }
    if (!isNull(slot.start) && !isNull(slot.end) && slot.start > slot.end) {
      errors.push("validationError.validBusinessTime");
    }
    return errors;
  });
