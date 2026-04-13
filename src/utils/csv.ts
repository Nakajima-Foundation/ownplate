type CsvValue = string | number | boolean | null | undefined;
type CsvRow = { [key: string]: CsvValue };

type CsvData = {
  data: CsvRow[];
  fields: string[];
  fieldNames?: string[];
  formulas?: { [key: string]: string };
};

type TranslateFn = (key: string) => string;

const regexEscape = /[,\t\n\r]/g;

const escapeCVS = (value: CsvValue): CsvValue => {
  if (typeof value === "string") {
    return value.replace(regexEscape, " ");
  }
  return value;
};

export const data2csv = (data: CsvData, t: TranslateFn) => {
  const header = (data.fieldNames || data.fields).join(",");
  const rows = data.data
    .map((item) => {
      return data.fields.map((field) => escapeCVS(item[field])).join(",");
    })
    .join("\n");
  const footers = data.formulas
    ? (() => {
        const formulas = data.fields.map((field, index) => {
          if (index === 0) {
            return t("order.total");
          }
          const formula = data.formulas?.[field];
          const col = String.fromCharCode(0x41 + index); // Handles only A-Z
          return formula
            ? `=${formula}(${col}2:${col}${data.data.length + 1})`
            : "";
        });
        return `\n${formulas.join(",")}`;
      })()
    : "";
  return `\ufeff${header}\n${rows}${footers}`;
};
