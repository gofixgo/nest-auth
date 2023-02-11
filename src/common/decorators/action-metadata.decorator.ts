import { SetMetadata } from '@nestjs/common';

export const ACTION_METADATA = 'ACTION';
export const Action = (actions: string[]) => {
  return SetMetadata(ACTION_METADATA, actions);
};
