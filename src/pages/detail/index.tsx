import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useCarpoolStore } from '@/store/carpoolStore';
import StatusBadge from '@/components/StatusBadge';
import {
  formatTime,
  getDestinationLabel,
  getDestinationEmoji,
  formatDate,
  generateCarpoolSummary
} from '@/utils/format';
import styles from './index.module.scss';

const DetailPage: React.FC = () => {
  const getRequestById = useCarpoolStore((s) => s.getRequestById);

  const instance = Taro.getCurrentInstance();
  const params = instance?.router?.params || {};
  const id = params.id as string;

  const request = id ? getRequestById(id) : undefined;

  const handleBack = () => {
    Taro.navigateBack({ delta: 1 }).catch(() => {
      Taro.switchTab({ url: '/pages/pool/index' });
    });
  };

  if (!request) {
    return (
      <View className={styles.pageContainer}>
        <View className={styles.iconBox}>
          <Text>🔍</Text>
        </View>
        <Text className={styles.title}>需求详情</Text>
        <Text className={styles.desc}>功能开发中，暂未找到该需求记录。</Text>
        <Button className={styles.btn} onClick={handleBack}>
          返回列表
        </Button>
      </View>
    );
  }

  return (
    <View className={styles.pageContainer}>
      <View className={styles.iconBox}>
        <Text>{getDestinationEmoji(request.destinationType)}</Text>
      </View>
      <Text className={styles.title}>{request.roomName} · 用车需求</Text>
      <Text className={styles.desc}>
        状态：{StatusBadge ? '' : ''}
        {request.status}
        {'\n\n'}
        📋 {generateCarpoolSummary(request)}
        {'\n\n'}
        提交时间：{formatDate(request.createdAt)}
        {'\n'}
        散场时间：{formatTime(request.estimatedEndTime)}
        {'\n'}
        目的地：{request.destinationName}（{getDestinationLabel(request.destinationType)}）
        {'\n'}
        DM：{request.dmName} | 人数：{request.playerCount}
        {request.budget ? `\n预算：¥${request.budget}` : ''}
        {request.contactPhone ? `\n电话：${request.contactPhone}` : ''}
        {request.remark ? `\n备注：${request.remark}` : ''}
      </Text>
      <View style={{ display: 'flex', gap: '16rpx' }}>
        <StatusBadge status={request.status} />
      </View>
      <View style={{ height: '32rpx' }} />
      <Button className={styles.btn} onClick={handleBack}>
        返回列表
      </Button>
    </View>
  );
};

export default DetailPage;
