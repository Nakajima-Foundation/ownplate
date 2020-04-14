import { ownPlateConfig } from "~/plugins/firebase.js";

const releaseName = ownPlateConfig.releasName || "default";

const releaseConfigs = {
  default: {},
  alpha: {
    hidePayment: true
  }
};

export const releaseConfig = releaseConfigs[releaseName];
