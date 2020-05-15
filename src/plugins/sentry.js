import Vue from 'vue';
import * as Sentry from '@sentry/browser';
import { Vue as VueIntegration } from '@sentry/integrations';

import { sentryDsn } from "@/config/project";

if (process.env.NODE_ENV !== "development") {
  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      integrations: [new VueIntegration({Vue, attachProps: true, logErrors: true})],
    });
  }
};
