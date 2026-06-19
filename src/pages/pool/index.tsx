import React, { useState, useMemo } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import StatusBadge from '@/components/StatusBadge';
import { useCarpoolStore } from '@/store/carpoolStore';
import {
  formatTime,
  getDestinationLabel,
  getDestinationEmoji,
  getCountdownMinutes,
  formatCountdown
} from '@/utils/format';
import type { CarpoolRequest, CarpoolStatus } from '@/types/carpool';
import styles from './index.module.scss';

type FilterType = 'all' | 'active' | 'completed' | 'cancelled';

const filters: Array<{ key: FilterType; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'active', label: '进行中' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' }
];

const PoolPage: React.FC = () => {
  const requests = useCarpoolStore((s) => s.requests);
  const updateRequestStatus = useCarpoolStore((s) => s.updateRequestStatus);

  const [filter, setFilter] = useState<FilterType>('all');

  const publishedRequests = useMemo(() => {
    return requests.filter(
      (r) => r.status === 'published' || r.status === 'completed' || r.status === 'cancelled'
    );
  }, [requests]);

  const filtered = useMemo(() => {
    const list = [...publishedRequests].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    switch (filter) {
      case 'active':
        return list.filter((r) => r.status === 'published');
      case 'completed':
        return list.filter((r) => r.status === 'completed');
      case 'cancelled':
        return list.filter((r) => r.status === 'cancelled');
      default:
        return list;
    }
  }, [publishedRequests, filter]);

  const activeCount = publishedRequests.filter((r) => r.status === 'published').length;
  const completedCount = publishedRequests.filter((r) => r.status === 'completed').length;

  const handleCall = (req: CarpoolRequest) => {
    if (!req.contactPhone) {
      Taro.showToast({ title: '暂无联系电话', icon: 'none' });
      return;
    }
    Taro.makePhoneCall({
      phoneNumber: req.contactPhone
    }).catch((err) => {
      console.error('[Pool] makePhoneCall error:', err);
    });
  };

  const handleCopySummary = (req: CarpoolRequest) => {
    const summary = `【${req.roomName}】${req.playerCount}人 ${formatTime(req.estimatedEndTime)}散场
目的地：${req.destinationName}
预算：¥${req.budget}
电话：${req.contactPhone}
${req.remark ? `备注：${req.remark}` : ''}`;
    Taro.setClipboardData({
      data: summary,
      success: () => Taro.showToast({ title: '已复制', icon: 'success' })
    });
  };

  const handleComplete = (req: CarpoolRequest) => {
    Taro.showModal({
      title: '确认完成',
      content: `确认【${req.roomName}】的用车需求已完成？`,
      success: (res) => {
        if (res.confirm) {
          updateRequestStatus(req.id, 'completed');
          console.log('[Pool] complete:', req.id);
          Taro.showToast({ title: '已完成', icon: 'success' });
        }
      }
    });
  };

  const handleDetail = (req: CarpoolRequest) => {
    Taro.navigateTo({
      url: `/pages/detail/index?id=${req.id}`
    }).catch((err) => {
      console.error('[Pool] navigateTo error:', err);
    });
  };

  if (publishedRequests.length === 0) {
    return (
      <View className={styles.pageContainer}>
        <View className={styles.statsRow}>
          <View className={classnames(styles.statCard, styles.statCardPrimary)}>
            <Text className={styles.statNumber}>{publishedRequests.length}</Text>
            <Text className={styles.statLabel}>车源总数</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statNumber}>{activeCount}</Text>
            <Text className={styles.statLabel}>进行中</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statNumber}>{completedCount}</Text>
            <Text className={styles.statLabel}>已完成</Text>
          </View>
        </View>
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>🚕</Text>
          <Text className={styles.emptyTitle}>车源池暂无需求</Text>
          <Text className={styles.emptyDesc}>
            前台审核并发布的用车需求会出现在这里，司机和调度员可实时查看
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.pageContainer}>
      <View className={styles.statsRow}>
        <View className={classnames(styles.statCard, styles.statCardPrimary)}>
          <Text className={styles.statNumber}>{publishedRequests.length}</Text>
          <Text className={styles.statLabel}>车源总数</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statNumber}>{activeCount}</Text>
          <Text className={styles.statLabel}>进行中</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statNumber}>{completedCount}</Text>
          <Text className={styles.statLabel}>已完成</Text>
        </View>
      </View>

      <View className={styles.filterTabs}>
        {filters.map((f) => (
          <View
            key={f.key}
            className={classnames(styles.filterTab, filter === f.key && styles.filterTabActive)}
            onClick={() => setFilter(f.key)}
          >
            <Text>{f.label}</Text>
          </View>
        ))}
      </View>

      {filtered.length === 0 ? (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📭</Text>
          <Text className={styles.emptyTitle}>暂无{filters.find((f) => f.key === filter)?.label}需求</Text>
        </View>
      ) : (
        filtered.map((req) => {
          const countdownMins = getCountdownMinutes(req.estimatedEndTime);
          const isUrgent = req.status === 'published' && countdownMins <= 30;

          return (
            <View
              key={req.id}
              className={classnames(
                styles.card,
                req.status === 'completed' && styles.cardCompleted,
                req.status === 'cancelled' && styles.cardCancelled
              )}
            >
              <View className={styles.cardHeader}>
                <View className={styles.roomRow}>
                  <View className={styles.roomMain}>
                    <Text className={styles.roomName}>{req.roomName}</Text>
                    <View className={styles.playersBadge}>
                      <Text>{req.playerCount}人</Text>
                    </View>
                  </View>
                  <Text className={styles.dmName}>DM {req.dmName}</Text>
                </View>
                <View className={styles.timeRow}>
                  <Text className={styles.endTime}>{formatTime(req.estimatedEndTime)}</Text>
                  {req.status === 'published' && (
                    <View
                      className={classnames(
                        styles.countdown,
                        isUrgent && styles.countdownUrgent
                      )}
                    >
                      <Text>{formatCountdown(countdownMins)}后</Text>
                    </View>
                  )}
                  <StatusBadge status={req.status as CarpoolStatus} />
                </View>
              </View>

              <View className={styles.destBox}>
                <Text className={styles.destEmoji}>
                  {getDestinationEmoji(req.destinationType)}
                </Text>
                <View className={styles.destContent}>
                  <Text className={styles.destName}>{req.destinationName}</Text>
                  <Text className={styles.destType}>
                    {getDestinationLabel(req.destinationType)}
                  </Text>
                </View>
              </View>

              <View className={styles.infoRow}>
                <View className={styles.infoItem}>
                  <Text className={styles.infoLabel}>预算</Text>
                  <Text className={classnames(styles.infoValue, styles.budgetValue)}>
                    ¥{req.budget}
                  </Text>
                </View>
                <View className={styles.infoItem}>
                  <Text className={styles.infoLabel}>电话</Text>
                  <Text className={styles.infoValue}>{req.contactPhone}</Text>
                </View>
              </View>

              <View className={styles.tagsRow}>
                {req.hasLuggage && (
                  <View className={classnames(styles.tag, styles.tagWarning)}>
                    <Text>🧳</Text>
                    <Text>有行李</Text>
                  </View>
                )}
                {req.acceptCarpool && (
                  <View className={styles.tag}>
                    <Text>🚗</Text>
                    <Text>可拼车</Text>
                  </View>
                )}
                {req.needFemaleDriver && (
                  <View className={classnames(styles.tag, styles.tagSuccess)}>
                    <Text>👩</Text>
                    <Text>女司机</Text>
                  </View>
                )}
                {req.remark && (
                  <View className={classnames(styles.tag, styles.tagWarning)}>
                    <Text>📝</Text>
                    <Text>{req.remark.length > 10 ? req.remark.slice(0, 10) + '...' : req.remark}</Text>
                  </View>
                )}
              </View>

              <View className={styles.actionRow}>
                <Button className={styles.btnSecondary} onClick={() => handleDetail(req)}>
                  详情
                </Button>
                <Button className={styles.btnSecondary} onClick={() => handleCopySummary(req)}>
                  复制
                </Button>
                {req.status === 'published' && (
                  <>
                    <Button className={styles.btnPrimary} onClick={() => handleCall(req)}>
                      呼叫
                    </Button>
                    <Button className={styles.btnSuccess} onClick={() => handleComplete(req)}>
                      完成
                    </Button>
                  </>
                )}
              </View>
            </View>
          );
        })
      )}
    </View>
  );
};

export default PoolPage;
