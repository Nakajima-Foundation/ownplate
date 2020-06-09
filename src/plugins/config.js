import { ownPlateConfig } from "@/config/project";

const releaseName = ownPlateConfig.releasName || "default";

const releaseConfigs = {
  default: {},
  alpha: {
    hidePayment: true,
    hideUsersLink: true
  },
  beta: {
  },
  "beta-dev": {
    underConstruction: true
  }
};

export const releaseConfig = releaseConfigs[releaseName];
