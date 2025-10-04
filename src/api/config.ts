// const isDevelopment = import.meta.env.DEV;
import { config } from '../../config.ts';

export const apiSettings = {
  // neteaseApiBase: isDevelopment ? config.DevNeteaseApiBase : config.ProductionNeteaseApiBase,
  neteaseApiBase: config.api.netease,
  realIP: config.realIP,
};
