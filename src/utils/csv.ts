const regexEscape = /[,\t\n\r]/g;

const escapeCVS = (value: any) => {
  if (typeof value === "string") {
    return value.replace(regexEscape, " ");
  }
  return value;
};

export const data2csv = (data: any, ctx: any) => {
  const header = (data.fieldNames || data.fields).join(",");
  const rows = data.data
    .map((item: any) => {
      return data.fields
        .map((field: string) => escapeCVS(item[field]))
        .join(",");
    })
    .join("\n");
  const footers = data.formulas
    ? (() => {
        const formulas = data.fields.map((field: string, index: number) => {
          if (index === 0) {
            return ctx.root.$t("order.total");
          }
          const formula = data.formulas[field];
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
