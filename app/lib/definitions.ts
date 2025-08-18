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
  location_id: string | null;
  category_id?: string | null;
  subcategory_id?: string | null;
  tag_ids?: string[] | null;
}

export interface StorageArea {
  id: string;
  name: string;
}

export interface Location {
  id: string;
  location_name: string;
  storage_area_ids: string[];
}

export interface ItemsByStorageArea {
  [key: string]: {
    [key: string]: Item[];
  };
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface Subcategory {
  id: string;
  name: string;
  category_id: string;
}

export interface Tag {
  id: string;
  name: string;
}
