export type CarpoolStatus = 'draft' | 'pending' | 'published' | 'completed' | 'cancelled';

export type DestinationType = 'subway' | 'university' | 'hotel' | 'mall' | 'custom';

export interface DestinationOption {
  id: string;
  type: DestinationType;
  name: string;
  address?: string;
}

export interface RoomOption {
  id: string;
  name: string;
  theme?: string;
}

export interface DmOption {
  id: string;
  name: string;
}

export interface CarpoolRequest {
  id: string;
  roomId: string;
  roomName: string;
  dmId: string;
  dmName: string;
  playerCount: number;
  estimatedEndTime: string;
  destinationId: string;
  destinationName: string;
  destinationType: DestinationType;
  hasLuggage?: boolean;
  acceptCarpool?: boolean;
  needFemaleDriver?: boolean;
  remark?: string;
  budget?: number;
  contactPhone?: string;
  status: CarpoolStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: 'host' | 'frontdesk';
}

export interface MissingField {
  key: keyof CarpoolRequest | 'luggage' | 'carpool' | 'femaleDriver';
  label: string;
  level: 'required' | 'recommended';
}

export interface CountdownReminder {
  id: string;
  carpoolId: string;
  roomName: string;
  dmName: string;
  endTime: string;
  reminded: boolean;
  confirmed: boolean;
}

export type RoleType = 'host' | 'frontdesk';
