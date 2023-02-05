import { SetMetadata } from '@nestjs/common';

export const SUBJECT_METADATA = 'SUBJECT';
export const Subject = (subject: string) => {
  return SetMetadata(SUBJECT_METADATA, subject);
};
