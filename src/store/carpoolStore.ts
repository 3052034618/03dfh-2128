import { create } from 'zustand';
import Taro from '@tarojs/taro';
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

const STORAGE_KEY_REQUESTS = 'carpool_requests';
const STORAGE_KEY_REMINDERS = 'carpool_reminders';
const STORAGE_KEY_ROLE = 'carpool_role';

const loadFromStorage = <T>(key: string, fallback: T): T => {
  try {
    const data = Taro.getStorageSync(key);
    if (data && data !== '') {
      return typeof data === 'string' ? JSON.parse(data) : data;
    }
  } catch (e) {
    console.warn('[Store] loadFromStorage error:', key, e);
  }
  return fallback;
};

const saveToStorage = (key: string, data: unknown) => {
  try {
    Taro.setStorageSync(key, JSON.stringify(data));
  } catch (e) {
    console.warn('[Store] saveToStorage error:', key, e);
  }
};

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
  getUpcomingReminders: (minutesAhead: number) => CountdownReminder[];

  setRole: (role: RoleType) => void;
  resetToMock: () => void;
}

export const useCarpoolStore = create<CarpoolState>((set, get) => {
  const initialRequests = loadFromStorage<CarpoolRequest[]>(STORAGE_KEY_REQUESTS, mockCarpoolRequests);
  const initialReminders = loadFromStorage<CountdownReminder[]>(STORAGE_KEY_REMINDERS, mockCountdownReminders);
  const initialRole = loadFromStorage<RoleType>(STORAGE_KEY_ROLE, 'host');

  console.log('[Store] init from storage, requests:', initialRequests.length);

  const persistRequests = (list: CarpoolRequest[]) => {
    saveToStorage(STORAGE_KEY_REQUESTS, list);
  };

  const persistReminders = (list: CountdownReminder[]) => {
    saveToStorage(STORAGE_KEY_REMINDERS, list);
  };

  const persistRole = (role: RoleType) => {
    saveToStorage(STORAGE_KEY_ROLE, role);
  };

  return {
    requests: initialRequests,
    reminders: initialReminders,
    rooms: [...mockRooms],
    dms: [...mockDms],
    destinations: [...mockDestinations],
    currentRole: initialRole,

    addRequest: (req) => {
      const now = new Date().toISOString();
      const newReq: CarpoolRequest = {
        ...req,
        id: genId(),
        status: 'pending',
        createdAt: now,
        updatedAt: now
      };
      const newList = [newReq, ...get().requests];
      set({ requests: newList });
      persistRequests(newList);

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
      const newList = get().requests.map((r) =>
        r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
      );
      set({ requests: newList });
      persistRequests(newList);
      console.log('[Store] updateRequest:', id, Object.keys(updates));
    },

    updateRequestStatus: (id, status) => {
      const newList = get().requests.map((r) =>
        r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r
      );
      set({ requests: newList });
      persistRequests(newList);
      console.log('[Store] updateRequestStatus:', id, status);
    },

    publishRequest: (id, budget, contactPhone) => {
      const newList = get().requests.map((r) =>
        r.id === id
          ? { ...r, budget, contactPhone, status: 'published', updatedAt: new Date().toISOString() }
          : r
      );
      set({ requests: newList });
      persistRequests(newList);
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
      const newList = [newReminder, ...get().reminders];
      set({ reminders: newList });
      persistReminders(newList);
      console.log('[Store] addReminder:', newReminder.id, newReminder.roomName);
    },

    markReminderReminded: (id) => {
      const newList = get().reminders.map((r) => (r.id === id ? { ...r, reminded: true } : r));
      set({ reminders: newList });
      persistReminders(newList);
    },

    markReminderConfirmed: (id, carpoolId) => {
      const newList = get().reminders.map((r) => (r.id === id ? { ...r, confirmed: true } : r));
      set({ reminders: newList });
      persistReminders(newList);
      get().updateRequest(carpoolId, {});
      console.log('[Store] markReminderConfirmed:', id);
    },

    getActiveReminders: () => {
      return get().reminders.filter((r) => !r.confirmed);
    },

    getUpcomingReminders: (minutesAhead) => {
      const now = Date.now();
      const threshold = now + minutesAhead * 60 * 1000;
      return get().reminders.filter((r) => {
        if (r.confirmed) return false;
        const endTime = new Date(r.endTime).getTime();
        return endTime <= threshold && endTime > now;
      });
    },

    setRole: (role) => {
      set({ currentRole: role });
      persistRole(role);
      console.log('[Store] setRole:', role);
    },

    resetToMock: () => {
      set({ requests: [...mockCarpoolRequests], reminders: [...mockCountdownReminders] });
      persistRequests(mockCarpoolRequests);
      persistReminders(mockCountdownReminders);
      console.log('[Store] resetToMock');
    }
  };
});
