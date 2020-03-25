import * as cheerio from 'cheerio'

export const parse_meta = (body) => {
  const parsed = cheerio.load(body);
  const meta = {};
  parsed('head meta').map((i, el) => {
    const property = parsed(el).attr('property')
    const content = parsed(el).attr('content')
    if (property && content) {
      meta[property] = content;
    }
  });
  return meta;
};
