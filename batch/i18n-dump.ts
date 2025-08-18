import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";


//const { en, ja } = i18n.messages;
// console.log(en, ja);
import en from "../src/lang/en";
import ja from "../src/lang/ja";
import fr from "../src/lang/fr";

const messages = {
  en, ja, fr
};


const main = async () => {
  const outDir = path.resolve(".i18n-cache");
  await mkdir(outDir, { recursive: true });

  await Promise.all(
    Object.entries(messages).map(([locale, data]) =>
      writeFile(path.join(outDir, `${locale}.json`), JSON.stringify(data, null, 2)),
    ),
  );

  console.log("i18n JSON dumped to .i18n-cache/");
};

main();
