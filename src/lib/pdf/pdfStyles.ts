// pdfmake に渡す体裁の定数。値だけなので、組み立て側と一緒に node から読める。

export const styles = {
  title: {
    font: "NotoSans",
    fontSize: 16,
    alignment: "center",
  },
  h1: {
    font: "NotoSans",
    fontSize: 18,
    bold: true,
  },
  style2: {
    alignment: "right",
    color: "blue",
  },
};

export const defaultStyle = {
  font: "NotoSans",
  fontSize: 8,
};

export const convMm2pt = (mm: number) => {
  return Math.round((mm / 0.35278) * 100) / 100;
};

// 2/3 * 54 = 18 * 2 = 36
export const pageSize = { width: convMm2pt(54), height: "auto" };
export const pageMargins = [0, 2, 0, 2];
