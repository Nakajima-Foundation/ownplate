// エミュレーターの口。firebase.json の emulators と同じ値でなければ繋がらない。
// 一致は test/unit/test_emulatorPorts.ts が見ている。
export const EMULATOR_HOST = "127.0.0.1";
export const FIRESTORE_EMULATOR_PORT = 8089;
export const AUTH_EMULATOR_PORT = 9099;
