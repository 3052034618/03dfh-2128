import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import type { CarpoolStatus } from '@/types/carpool';
import { getStatusLabel } from '@/utils/format';
import styles from './index.module.scss';

interface StatusBadgeProps {
  status: CarpoolStatus;
  showDot?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, showDot = true }) => {
  const dotClassMap: Record<CarpoolStatus, string> = {
    draft: styles.dotDraft,
    pending: styles.dotPending,
    published: styles.dotPublished,
    completed: styles.dotCompleted,
    cancelled: styles.dotCancelled
  };

  return (
    <View className={classnames(styles.badge, styles[status])}>
      {showDot && <View className={classnames(styles.dot, dotClassMap[status])} />}
      <Text>{getStatusLabel(status)}</Text>
    </View>
  );
};

export default StatusBadge;
