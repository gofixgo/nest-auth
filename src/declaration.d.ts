type Role = {
  role_id: string;
  role_name: string;
  role_name_fa: string;
};
type IUserPayload = {
  user_id: string;
  user_email: string;
  user_username: string;
  user_roles: Role[];
  user_phone_number: string;
  user_first_name: string;
  user_last_name: string;
  user_password: string;
};

type IUserAuth = Omit<import('./modules/user/user.entity').User, 'user_password'>;

type PaginationDto = {
  total_items: number;
  total_pages: number;
  items_count: number;
  current_page: number;
  items_per_page: number;
};

type ServiceReturnType<T = unknown> = {
  result?: T;
  status: number;
  message?: string;
  pagination?: PaginationDto;
};
