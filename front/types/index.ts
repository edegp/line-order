export type Message = {
  no: string;
  name: string;
  day: string;
  people: number;
  start: string;
  end: string;
  LIFF_INITED: boolean;
  [key: string]: any;
};

export type LineUser = {
  expire: number;
  userId: string;
  name: string;
  image?: string;
  token: string;
  idToken: string;
};
type StringObject = {
  [key: string]: string;
};
export type T = {
  [key: string]: string | StringObject;
  type: string;
  language: string;
  title: string;
  top: StringObject;
  menu: StringObject;
  basket: StringObject;
  completed: StringObject;
  payment: StringObject;
  paymentCompleted: StringObject;
  header: StringObject;
  menucard: StringObject;
  ordered: StringObject;
  utils: StringObject;
  tableorder: {};
  error: StringObject;
};

export type Order = {
  price: number;
  count: number;
  total: number;
  order: MenuType;
};

export type Orders = {
  [key: number]: { [key: number]: Order };
};

export type State = {
  message?: Message;
  started: string;
  locales: string[];
  locale: string;
  sessionId: string;
  lineUser: LineUser;
  axiosError?: Object;
  t?: T;
  isLoading: boolean;
  paymentError?: Object;
  paymentId: string;
  customer: Customer;
  orders?: Orders;
  ordered?: Object;
};

export type Customer = {
  seatNo: number;
  userId: string;
  name: string;
  image: string;
  token: string;
};

export type Items = {
  categoryId: number;
  categoryName: string;
  items: MenuType[];
  orderNo: number;
};

export type MenuType = {
  categoryId: number;
  categoryName: string;
  discountRate: number;
  discountWay: number;
  imageUrl: string;
  itemDespription: string;
  itemId: number;
  itemName: string;
  orderNo: number;
  price: number;
  stockoutFlg: boolean;
};

export type Category = {
  categoryId: number;
  categoryName: string;
  orderNo: number;
};
