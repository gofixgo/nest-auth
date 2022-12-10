import { User } from './user.entity';

export const USER_SELECT_ALL: (keyof User)[] = [
  'user_id',
  'user_tel',
  'user_first_name',
  'user_last_name',
  'user_username',
  'user_email',
  'user_phone_number',
  'user_address',
  'user_deleted',
  'user_created_at',
  'user_deleted_at',
  'user_updated_at',
];
