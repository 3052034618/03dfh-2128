import React, { useState, useEffect } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import type { CountdownReminder } from '@/types/carpool';
import { formatTime, getCountdownMinutes, formatCountdown } from '@/utils/format';
import { useCarpoolStore } from '@/store/carpoolStore';
import styles from './index.module.scss';

interface CountdownCardProps {
  reminder: CountdownReminder;
}

const CountdownCard: React.FC<CountdownCardProps> = ({ reminder }) => {
  const [minutes, setMinutes] = useState<number>(getCountdownMinutes(reminder.endTime));
  const markReminderConfirmed = useCarpoolStore((s) => s.markReminderConfirmed);

  useEffect(() => {
    const timer = setInterval(() => {
      setMinutes(getCountdownMinutes(reminder.endTime));
    }, 60 * 1000);
    return () => clearInterval(timer);
  }, [reminder.endTime]);

  const isUrgent = minutes <= 30;

  const handleConfirm = () => {
    Taro.showModal({
      title: '确认用车',
      content: `确认${reminder.roomName}的玩家需要用车？`,
      success: (res) => {
        if (res.confirm) {
          markReminderConfirmed(reminder.id, reminder.carpoolId);
          Taro.showToast({ title: '已确认', icon: 'success' });
        }
      }
    });
  };

  const handleSkip = () => {
    Taro.showActionSheet({
      itemList: ['不需要用车，取消订单', '稍后再提醒'],
      success: (res) => {
        if (res.tapIndex === 0) {
          const updateRequestStatus = useCarpoolStore.getState().updateRequestStatus;
          updateRequestStatus(reminder.carpoolId, 'cancelled');
          markReminderConfirmed(reminder.id, reminder.carpoolId);
          Taro.showToast({ title: '已取消', icon: 'none' });
        }
      }
    });
  };

  if (reminder.confirmed) {
    return (
      <View className={styles.card}>
        <View className={styles.iconRow}>
          <Text className={styles.icon}>✅</Text>
          <Text className={styles.title}>已确认用车</Text>
        </View>
        <View className={styles.contentRow}>
          <View className={styles.roomInfo}>
            <Text className={styles.roomName}>{reminder.roomName}</Text>
            <Text className={styles.dmName}>DM {reminder.dmName}</Text>
          </View>
        </View>
        <View className={styles.confirmedBadge}>
          <Text>✓ 已确认，保持联系即可</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={classnames(styles.card, isUrgent && styles.urgent)}>
      <View className={styles.iconRow}>
        <Text className={styles.icon}>{isUrgent ? '⏰' : '⌛'}</Text>
        <Text className={styles.title}>{isUrgent ? '即将散场，请立即确认' : '散场倒计时'}</Text>
      </View>

      <View className={styles.contentRow}>
        <View className={styles.roomInfo}>
          <Text className={styles.roomName}>{reminder.roomName}</Text>
          <Text className={styles.dmName}>DM {reminder.dmName}</Text>
        </View>
        <View className={styles.countdownBox}>
          <Text className={styles.countdownLabel}>距离散场</Text>
          <Text className={styles.countdownValue}>{formatCountdown(minutes)}</Text>
          <Text className={styles.endTime}>预计 {formatTime(reminder.endTime)}</Text>
        </View>
      </View>

      <View className={styles.actionRow}>
        <Button className={styles.btnSkip} onClick={handleSkip}>
          暂不需要
        </Button>
        <Button className={styles.btnConfirm} onClick={handleConfirm}>
          确认用车
        </Button>
      </View>
    </View>
  );
};

export default CountdownCard;
