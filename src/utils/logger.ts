import Logger from '@raj30/logger';
import { loggerConfig } from '../config/constants';

export const logger = new Logger({
  logLevel: loggerConfig.logLevel,
  metaFields: {},
});
