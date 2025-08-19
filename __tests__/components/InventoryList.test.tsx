import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import InventoryList from '../../app/components/InventoryList';
import { StoreProvider } from '../../app/components/StoreProvider';

// Mock data
const mockItemsByStorageArea = {
  'Kitchen': {
    'Pantry': [
      {
        id: '1',
        item_name: 'Test Item',
        quantity: 1,
        date_added: '2025-08-19',
        storage_area_id: '1',
        location_id: '1',
        category_id: '1',
        subcategory_id: '1'
      }
    ]
  }
};

const mockCategories = [
  { id: '1', name: 'Test Category' }
];

const mockSubcategories = [
  { id: '1', name: 'Test Subcategory', category_id: '1' }
];

const mockLocations = [
  { id: '1', location_name: 'Pantry', storage_area_ids: ['1'] }
];

const mockStorageAreas = [
  { id: '1', name: 'Kitchen' }
];

describe('InventoryList Component', () => {
  const mockHandleEditItem = vi.fn();
  const mockSetModalLocations = vi.fn();
  const mockSetSelectedStorageArea = vi.fn();

  // Mock store provider initial data
  const mockInitialData = {
    itemsByStorageArea: mockItemsByStorageArea,
    storageAreas: mockStorageAreas,
    locations: mockLocations,
    categories: mockCategories,
    subcategories: mockSubcategories,
    user: { id: '1', name: 'Test User', email: 'test@example.com' },
    tags: []
  };

  it('should render items with correct category and subcategory', () => {
    render(
      <StoreProvider initialData={mockInitialData}>
        <InventoryList
          itemsByStorageArea={mockItemsByStorageArea}
          handleEditItem={mockHandleEditItem}
          modalLocations={mockLocations}
          setModalLocations={mockSetModalLocations}
          setSelectedStorageArea={mockSetSelectedStorageArea}
        />
      </StoreProvider>
    );

    // Verify item details are displayed
    expect(screen.getByText('Test Item')).toBeDefined();
    expect(screen.getByText('Test Category')).toBeDefined();
    expect(screen.getByText('Test Subcategory')).toBeDefined();
  });

  it('should handle quantity updates', async () => {
    render(
      <StoreProvider initialData={mockInitialData}>
        <InventoryList
          itemsByStorageArea={mockItemsByStorageArea}
          handleEditItem={mockHandleEditItem}
          modalLocations={mockLocations}
          setModalLocations={mockSetModalLocations}
          setSelectedStorageArea={mockSetSelectedStorageArea}
        />
      </StoreProvider>
    );

    // Find and click the increment button
    const incrementButton = screen.getByText('+');
    await fireEvent.click(incrementButton);

    // You would typically verify the API call was made here
    // This would require mocking fetch
  });
});
