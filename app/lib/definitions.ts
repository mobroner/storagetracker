export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Item {
  id: string;
  item_name: string;
  quantity: number;
  date_added: string;
  expiry_date: string | null;
  barcode: string | null;
  storage_area_id: string;
  group_id: string | null;
}

export interface StorageArea {
  id: string;
  name: string;
}

export interface Group {
  id: string;
  group_name: string;
  storage_area_ids: string[];
}

export interface ItemsByStorageArea {
  [key: string]: {
    [key: string]: Item[];
  };
}
