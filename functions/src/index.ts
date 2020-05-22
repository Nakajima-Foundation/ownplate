import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

import * as Sentry from '@sentry/node';

import exportIfNeeded from './common/exportifneeded';

const senty_dsn = functions.config() && functions.config().senty && functions.config().senty.dsn || process.env.SENTY_DSN;
Sentry.init({ dsn: senty_dsn });

if (!admin.apps.length) {
  admin.initializeApp();
}

exportIfNeeded("api", "api", exports);

exportIfNeeded("systemGetConfig", "systemGetConfig", exports);

exportIfNeeded("lineValidate", "lineValidate", exports);

exportIfNeeded("wasOrderCreated2", "order/wasOrderCreated2", exports);
exportIfNeeded("orderUpdate", "order/orderUpdate", exports);
exportIfNeeded("orderPlace", "order/orderPlace", exports);

exportIfNeeded("stripeConnect", "stripe/stripeConnect", exports);
exportIfNeeded("stripeDisconnect", "stripe/stripeDisconnect", exports);

exportIfNeeded("stripeCreateIntent", "stripe/stripeCreateIntent", exports);
exportIfNeeded("stripeConfirmIntent", "stripe/stripeConfirmIntent", exports);
exportIfNeeded("stripeCancelIntent", "stripe/stripeCancelIntent", exports);

exportIfNeeded("imageProcessing", "image/imageProcessing", exports);
