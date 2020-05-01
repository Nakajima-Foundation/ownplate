import { ownPlateConfig } from "@/config/project";

const releaseName = ownPlateConfig.releasName || "default";

const releaseConfigs = {
  default: {},
  alpha: {
    hidePayment: true,
    hideUsersLink: true
  },
  beta: {
    hideUsersLink: true
  }
};

export const releaseConfig = releaseConfigs[releaseName];
