import * as express from 'express';
import * as admin from 'firebase-admin';
import * as fs from 'fs';

export const app = express();
export const router = express.Router();

// for test, db is not immutable
if (!admin.apps.length) {
  admin.initializeApp();
}

//let db = admin.firestore();
//export const updateDb = (_db) => {
//  db = _db;
//}

export const logger = async (req, res, next) => {
  next();
}
export const hello_response = async (req, res) =>{
  res.json({message: "hello"});
};

const ogpPage = async (req: any, res: any) => {
  const { restaurantName } = req.params;

  const escapeHtml = (str: string): string => {
    if (typeof str !== 'string') {
      return '';
    }
    const mapping:any = {
      '&': '&amp;',
      "'": '&#x27;',
      '`': '&#x60;',
      '"': '&quot;',
      '<': '&lt;',
      '>': '&gt;',
    };
    return str.replace(/[&'`"<>]/g, function(match) {
      return mapping[match]
    });
  }

  const title = "Adana Restaurant";

  res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
  fs.readFile('./templates/index.html', 'utf8', (err, data) => {
    const regex = /<title.*title>/
    const metas =
      [
        `<title>${escapeHtml(title)}</title>`,
        `<meta property="og:title" content="${escapeHtml(title)}" />`,
        `<meta property="og:site_name" content="${escapeHtml(title)}" />`,
        `<meta property="og:type" content="website" />`,
        `<meta property="og:url" content="https://staging.ownplate.today/r/${restaurantName}" />`,
        `<meta property="og:description" content="Japanese comfort food" />`,
        `<meta property="og:image" content="https://static.wixstatic.com/media/bafa8d_9cd1d487e24140aba7b6885e198cb62e~mv2_d_4928_3264_s_4_2.jpg/v1/fill/w_980,h_1350,al_c,q_85,usm_0.66_1.00_0.01/bafa8d_9cd1d487e24140aba7b6885e198cb62e~mv2_d_4928_3264_s_4_2.webp" />`,
      ].join("\n");
    res.send(data.replace(regex, metas));
  });
};

router.get('/hello',
           logger,
           hello_response);

app.use('/1.0', router);

app.get('/r/:restaurantName', ogpPage);
app.get('/r/:restaurantpName/*', ogpPage);
