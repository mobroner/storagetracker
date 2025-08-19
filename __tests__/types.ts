export interface TestUser {
  id: string;
  email: string;
  password: string;
}

export interface TestData {
  userId: string;
  storageAreaId: string;
  locationId: string;
  categoryId?: string;
}
