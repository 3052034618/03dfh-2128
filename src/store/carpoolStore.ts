import { create } from 'zustand';
import type {
  CarpoolRequest,
  CarpoolStatus,
  CountdownReminder,
  RoleType,
  DestinationOption,
  RoomOption,
  DmOption
} from '@/types/carpool';
import {
  mockCarpoolRequests,
  mockCountdownReminders,
  mockRooms,
  mockDms,
  mockDestinations
} from '@/data/mockData';
import { genId } from '@/utils/format';

interface CarpoolState {
  requests: CarpoolRequest[];
  reminders: CountdownReminder[];
  rooms: RoomOption[];
  dms: DmOption[];
  destinations: DestinationOption[];
  currentRole: RoleType;

  addRequest: (req: Omit<CarpoolRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => CarpoolRequest;
  updateRequest: (id: string, updates: Partial<CarpoolRequest>) => void;
  updateRequestStatus: (id: string, status: CarpoolStatus) => void;
  publishRequest: (id: string, budget: number, contactPhone: string) => void;
  getRequestsByStatus: (status: CarpoolStatus) => CarpoolRequest[];
  getRequestById: (id: string) => CarpoolRequest | undefined;

  addReminder: (reminder: Omit<CountdownReminder, 'id' | 'reminded' | 'confirmed'>) => void;
  markReminderReminded: (id: string) => void;
  markReminderConfirmed: (id: string, carpoolId: string) => void;
  getActiveReminders: () => CountdownReminder[];

  setRole: (role: RoleType) => void;
}

export const useCarpoolStore = create<CarpoolState>((set, get) => ({
  requests: [...mockCarpoolRequests],
  reminders: [...mockCountdownReminders],
  rooms: [...mockRooms],
  dms: [...mockDms],
  destinations: [...mockDestinations],
  currentRole: 'host',

  addRequest: (req) => {
    const now = new Date().toISOString();
    const newReq: CarpoolRequest = {
      ...req,
      id: genId(),
      status: 'pending',
      createdAt: now,
      updatedAt: now
    };
    set((state) => ({
      requests: [newReq, ...state.requests]
    }));

    get().addReminder({
      carpoolId: newReq.id,
      roomName: newReq.roomName,
      dmName: newReq.dmName,
      endTime: newReq.estimatedEndTime
    });

    console.log('[Store] addRequest:', newReq.id, newReq.roomName);
    return newReq;
  },

  updateRequest: (id, updates) => {
    set((state) => ({
      requests: state.requests.map((r) =>
        r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
      )
    }));
    console.log('[Store] updateRequest:', id, Object.keys(updates));
  },

  updateRequestStatus: (id, status) => {
    set((state) => ({
      requests: state.requests.map((r) =>
        r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r
      )
    }));
    console.log('[Store] updateRequestStatus:', id, status);
  },

  publishRequest: (id, budget, contactPhone) => {
    set((state) => ({
      requests: state.requests.map((r) =>
        r.id === id
          ? { ...r, budget, contactPhone, status: 'published', updatedAt: new Date().toISOString() }
          : r
      )
    }));
    console.log('[Store] publishRequest:', id, '预算:', budget);
  },

  getRequestsByStatus: (status) => {
    return get().requests.filter((r) => r.status === status);
  },

  getRequestById: (id) => {
    return get().requests.find((r) => r.id === id);
  },

  addReminder: (reminder) => {
    const newReminder: CountdownReminder = {
      ...reminder,
      id: genId(),
      reminded: false,
      confirmed: false
    };
    set((state) => ({
      reminders: [newReminder, ...state.reminders]
    }));
    console.log('[Store] addReminder:', newReminder.id, newReminder.roomName);
  },

  markReminderReminded: (id) => {
    set((state) => ({
      reminders: state.reminders.map((r) => (r.id === id ? { ...r, reminded: true } : r))
    }));
  },

  markReminderConfirmed: (id, carpoolId) => {
    set((state) => ({
      reminders: state.reminders.map((r) => (r.id === id ? { ...r, confirmed: true } : r))
    }));
    get().updateRequest(carpoolId, {});
    console.log('[Store] markReminderConfirmed:', id);
  },

  getActiveReminders: () => {
    return get().reminders.filter((r) => !r.confirmed);
  },

  setRole: (role) => {
    set({ currentRole: role });
    console.log('[Store] setRole:', role);
  }
}));
