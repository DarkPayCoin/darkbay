import { types } from '@darkpay/dark-types/substrate/preparedTypes'
import { registry } from '@darkpay/dark-types/substrate/registry';
import { newLogger } from '@darkpay/dark-utils';

const log = newLogger('DarkdotTypes')

export const registerDarkdotTypes = (): void => {
  try {
    registry.register(types);
    log.info('Succesfully registered custom types of Darkdot modules')
  } catch (err) {
    log.error('Failed to register custom types of Darkdot modules:', err);
  }
};

export default registerDarkdotTypes;
