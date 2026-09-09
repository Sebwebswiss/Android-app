export type ItemStatus = 'available' | 'in_use' | 'loaned' | 'missing';

export interface Item {
  id: string;
  name: string;
  description: string;
  quantity: number;
  roomId: string;
  roomName: string;
  container: string; // e.g., "Kutija #3", "Ladica 2", "Gornja polica"
  containerCode?: string; // e.g., "KUT-TAV-01"
  subLocation?: string; // e.g., "Lijevi kut iza ormara", "Ispod stola"
  category: string;
  tags: string[];
  colorTag?: string; // Hex or identifier for visual box color
  status: ItemStatus;
  loanedTo?: string; // Who borrowed it, if applicable
  photoUrl?: string; // Base64 data URL or preset icon
  createdAt: string;
  updatedAt: string;
  lastCheckedDate?: string;
  notes?: string;
}

export interface Room {
  id: string;
  name: string;
  iconName: string;
  description: string;
  color: string;
}

export interface CategoryDefinition {
  id: string;
  name: string;
  iconName: string;
  color: string;
}

export type ViewMode = 'finder' | 'all-items' | 'by-location' | 'containers' | 'item-details';
