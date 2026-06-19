import dayjs from 'dayjs';
import type { CarpoolRequest, DestinationType, CarpoolStatus, MissingField } from '@/types/carpool';

export const formatTime = (isoString: string, format: string = 'HH:mm'): string => {
  return dayjs(isoString).format(format);
};

export const formatDate = (isoString: string): string => {
  return dayjs(isoString).format('MM-DD HH:mm');
};

export const getCountdownMinutes = (isoString: string): number => {
  const diff = dayjs(isoString).diff(dayjs(), 'minute');
  return Math.max(0, diff);
};

export const formatCountdown = (minutes: number): string => {
  if (minutes <= 0) return '已到时间';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) {
    return `${h}小时${m}分钟`;
  }
  return `${m}分钟`;
};

export const getDestinationLabel = (type: DestinationType): string => {
  const map: Record<DestinationType, string> = {
    subway: '地铁站',
    university: '大学城',
    hotel: '酒店',
    mall: '商圈',
    custom: '自定义'
  };
  return map[type];
};

export const getDestinationEmoji = (type: DestinationType): string => {
  const map: Record<DestinationType, string> = {
    subway: '🚇',
    university: '🎓',
    hotel: '🏨',
    mall: '🛍️',
    custom: '📍'
  };
  return map[type];
};

export const getStatusLabel = (status: CarpoolStatus): string => {
  const map: Record<CarpoolStatus, string> = {
    draft: '草稿',
    pending: '待发布',
    published: '已发布',
    completed: '已完成',
    cancelled: '已取消'
  };
  return map[status];
};

export const generateCarpoolSummary = (req: CarpoolRequest): string => {
  const parts: string[] = [];
  parts.push(`【${req.roomName}】${req.dmName}带${req.playerCount}人`);
  parts.push(`${formatTime(req.estimatedEndTime)}散场`);
  parts.push(`前往${getDestinationEmoji(req.destinationType)}${req.destinationName}`);

  const tags: string[] = [];
  if (req.hasLuggage) tags.push('有行李');
  if (req.acceptCarpool) tags.push('可拼车');
  if (req.needFemaleDriver) tags.push('需女司机');
  if (tags.length > 0) parts.push(`(${tags.join('、')})`);

  if (req.budget) parts.push(`预算¥${req.budget}`);
  if (req.contactPhone) parts.push(`联系${req.contactPhone}`);

  return parts.join(' · ');
};

export const checkMissingFields = (req: Partial<CarpoolRequest>): MissingField[] => {
  const missing: MissingField[] = [];

  if (req.hasLuggage === undefined) {
    missing.push({ key: 'luggage', label: '是否有行李', level: 'recommended' });
  }
  if (req.acceptCarpool === undefined) {
    missing.push({ key: 'carpool', label: '是否接受拼车', level: 'recommended' });
  }
  if (req.needFemaleDriver === undefined) {
    missing.push({ key: 'femaleDriver', label: '是否需要女司机', level: 'recommended' });
  }

  if (req.status === 'pending' || req.status === 'published') {
    if (!req.budget) {
      missing.push({ key: 'budget', label: '预算金额', level: 'required' });
    }
    if (!req.contactPhone) {
      missing.push({ key: 'contactPhone', label: '联系电话', level: 'required' });
    }
  }

  return missing;
};

export const genId = (): string => {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
};

export const addMinutes = (minutes: number): string => {
  return dayjs().add(minutes, 'minute').toISOString();
};
