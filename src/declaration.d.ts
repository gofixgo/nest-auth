type IUserPayload = {
  id: string;
  email: string;
  username: string;
  phone_number: string;
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
