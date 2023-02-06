type IUserPayload = {
  id: string;
  email: string;
  username: string;
  role_id: string;
  device_id?: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  password: string;
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
