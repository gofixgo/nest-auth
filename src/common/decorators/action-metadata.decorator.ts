import { SetMetadata } from '@nestjs/common';

export const ACTION_METADATA = 'ACTION';
export const Action = (action: string) => {
  return SetMetadata(ACTION_METADATA, action);
};
