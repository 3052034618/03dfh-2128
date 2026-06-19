import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

type TagVariant = 'default' | 'warning' | 'success';
type TagSize = 'normal' | 'small';

interface OptionTagProps {
  label: string;
  emoji?: string;
  active?: boolean;
  variant?: TagVariant;
  size?: TagSize;
  showCheck?: boolean;
  onClick?: () => void;
}

const OptionTag: React.FC<OptionTagProps> = ({
  label,
  emoji,
  active = false,
  variant = 'default',
  size = 'normal',
  showCheck = false,
  onClick
}) => {
  return (
    <View
      className={classnames(
        styles.tag,
        active && styles.tagActive,
        variant === 'warning' && styles.tagWarning,
        variant === 'success' && styles.tagSuccess,
        size === 'small' && styles.tagSmall
      )}
      onClick={onClick}
    >
      {emoji && <Text>{emoji}</Text>}
      <Text>{label}</Text>
      {showCheck && active && <Text className={styles.checkIcon}>✓</Text>}
    </View>
  );
};

export default OptionTag;
