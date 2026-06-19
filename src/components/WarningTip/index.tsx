import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import type { MissingField } from '@/types/carpool';
import styles from './index.module.scss';

interface WarningTipProps {
  fields: MissingField[];
  onFieldClick?: (key: MissingField['key']) => void;
}

const WarningTip: React.FC<WarningTipProps> = ({ fields, onFieldClick }) => {
  if (fields.length === 0) {
    return (
      <View className={styles.successBox}>
        <Text className={styles.successIcon}>🎉</Text>
        <Text className={styles.successText}>信息已填写完整，可提交审核</Text>
      </View>
    );
  }

  const requiredCount = fields.filter((f) => f.level === 'required').length;

  return (
    <View className={styles.tipBox}>
      <View className={styles.tipHeader}>
        <Text className={styles.tipIcon}>⚠️</Text>
        <Text className={styles.tipTitle}>
          {requiredCount > 0 ? '还有必填项未完成' : '建议补充以下信息'}
        </Text>
        <Text className={styles.tipCount}>{fields.length}项待完善</Text>
      </View>
      <View className={styles.tipList}>
        {fields.map((field) => (
          <View className={styles.tipItem} key={String(field.key)}>
            <View
              className={classnames(
                styles.levelBadge,
                field.level === 'required' ? styles.levelRequired : styles.levelRecommended
              )}
            >
              {field.level === 'required' ? '必填' : '建议'}
            </View>
            <Text className={styles.tipLabel}>{field.label}</Text>
            <View className={styles.tipAction} onClick={() => onFieldClick?.(field.key)}>
              <Text>去填写</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default WarningTip;
