// 継ぎ目。copy2functions.sh でコピーされる menu.ts などが "./firebaseUtils" を拡張子なしで
// 指すので、同じ import 文がコピー先では firebase-admin から型を出す
// functions/src/models/firebaseUtils.ts に解決される。ここを消すと両側が繋がらない。
import { FieldValue, Timestamp } from "firebase/firestore";

export { FieldValue, Timestamp };
