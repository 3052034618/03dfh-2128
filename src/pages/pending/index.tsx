import React, { useState, useMemo } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import StatusBadge from '@/components/StatusBadge';
import WarningTip from '@/components/WarningTip';
import { useCarpoolStore } from '@/store/carpoolStore';
import {
  formatTime,
  getDestinationLabel,
  getDestinationEmoji,
  checkMissingFields,
  generateCarpoolSummary,
  getCountdownMinutes,
  formatCountdown
} from '@/utils/format';
import type { CarpoolRequest, MissingField } from '@/types/carpool';
import styles from './index.module.scss';

const quickBudgets = [50, 80, 100, 150, 200];

const PendingPage: React.FC = () => {
  const pendingRequests = useCarpoolStore((s) => s.getRequestsByStatus('pending'));
  const publishedCount = useCarpoolStore((s) => s.getRequestsByStatus('published').length);
  const publishRequest = useCarpoolStore((s) => s.publishRequest);
  const updateRequestStatus = useCarpoolStore((s) => s.updateRequestStatus);

  const [budgets, setBudgets] = useState<Record<string, string>>({});
  const [phones, setPhones] = useState<Record<string, string>>({});

  const handleBudgetChange = (id: string, val: string) => {
    setBudgets((prev) => ({ ...prev, [id]: val }));
  };

  const handlePhoneChange = (id: string, val: string) => {
    setPhones((prev) => ({ ...prev, [id]: val }));
  };

  const handleQuickBudget = (id: string, val: number) => {
    setBudgets((prev) => ({ ...prev, [id]: String(val) }));
  };

  const getMissingFields = (req: CarpoolRequest): MissingField[] => {
    const budgetVal = budgets[req.id];
    const phoneVal = phones[req.id];
    const draft: Partial<CarpoolRequest> = {
      ...req,
      budget: req.budget || (budgetVal ? Number(budgetVal) : undefined),
      contactPhone: req.contactPhone || phoneVal,
      status: 'pending'
    };
    return checkMissingFields(draft);
  };

  const canPublish = (req: CarpoolRequest): boolean => {
    const budgetVal = req.budget || Number(budgets[req.id] || 0);
    const phoneVal = req.contactPhone || phones[req.id];
    return budgetVal > 0 && !!phoneVal && phoneVal.length >= 7;
  };

  const handlePublish = (req: CarpoolRequest) => {
    if (!canPublish(req)) {
      Taro.showToast({ title: '请先填写预算和电话', icon: 'none' });
      return;
    }
    const budget = req.budget || Number(budgets[req.id]);
    const phone = req.contactPhone || phones[req.id];

    Taro.showModal({
      title: '确认发布',
      content: `发布【${req.roomName}】的用车需求到门店车源池？`,
      success: (res) => {
        if (res.confirm) {
          publishRequest(req.id, budget, phone);
          console.log('[Pending] publishRequest:', req.id, '预算:', budget);
          Taro.showToast({ title: '已发布到车源池', icon: 'success' });
        }
      }
    });
  };

  const handleCancel = (req: CarpoolRequest) => {
    Taro.showActionSheet({
      itemList: ['退回主持人', '取消此需求'],
      success: (res) => {
        updateRequestStatus(req.id, 'cancelled');
        console.log('[Pending] cancelRequest:', req.id);
        Taro.showToast({ title: '已取消', icon: 'none' });
      }
    });
  };

  const sortedRequests = useMemo(() => {
    return [...pendingRequests].sort((a, b) => {
      return new Date(a.estimatedEndTime).getTime() - new Date(b.estimatedEndTime).getTime();
    });
  }, [pendingRequests]);

  const urgentCount = sortedRequests.filter(
    (r) => getCountdownMinutes(r.estimatedEndTime) <= 60
  ).length;

  const onPullDownRefresh = () => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '已刷新', icon: 'none' });
    }, 500);
  };

  React.useEffect(() => {
    Taro.eventCenter && Taro.eventCenter.on('__taroPullDownRefresh', onPullDownRefresh);
    return () => {
      Taro.eventCenter && Taro.eventCenter.off('__taroPullDownRefresh', onPullDownRefresh);
    };
  }, []);

  if (sortedRequests.length === 0) {
    return (
      <View className={styles.pageContainer}>
        <View className={styles.statsRow}>
          <View className={classnames(styles.statCard, styles.statCardPrimary)}>
            <Text className={styles.statNumber}>{sortedRequests.length}</Text>
            <Text className={styles.statLabel}>待发布</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statNumber}>{publishedCount}</Text>
            <Text className={styles.statLabel}>今日已发布</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statNumber}>{urgentCount}</Text>
            <Text className={styles.statLabel}>1小时内紧急</Text>
          </View>
        </View>
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>🎉</Text>
          <Text className={styles.emptyTitle}>暂无待审核需求</Text>
          <Text className={styles.emptyDesc}>
            主持人提交的用车需求会出现在这里，补充预算和电话后即可发布
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.pageContainer}>
      <View className={styles.statsRow}>
        <View className={classnames(styles.statCard, styles.statCardPrimary)}>
          <Text className={styles.statNumber}>{sortedRequests.length}</Text>
          <Text className={styles.statLabel}>待发布</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statNumber}>{publishedCount}</Text>
          <Text className={styles.statLabel}>今日已发布</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statNumber}>{urgentCount}</Text>
          <Text className={styles.statLabel}>紧急单</Text>
        </View>
      </View>

      {sortedRequests.map((req) => {
        const missing = getMissingFields(req);
        const countdownMins = getCountdownMinutes(req.estimatedEndTime);
        const isUrgent = countdownMins <= 60;

        return (
          <View className={styles.card} key={req.id}>
            <View className={styles.cardHeader}>
              <View className={styles.roomInfo}>
                <Text className={styles.roomName}>{req.roomName}</Text>
                <View className={styles.dmBadge}>DM {req.dmName}</View>
              </View>
              <StatusBadge status={req.status} />
            </View>

            <View className={styles.metaGrid}>
              <View className={styles.metaItem}>
                <Text className={styles.metaEmoji}>👥</Text>
                <Text className={styles.metaValue}>{req.playerCount}人</Text>
              </View>
              <View className={styles.metaItem}>
                <Text className={styles.metaEmoji}>⏰</Text>
                <Text className={styles.metaValue}>{formatTime(req.estimatedEndTime)}</Text>
              </View>
              <View className={styles.metaItem}>
                <Text className={styles.metaEmoji}>
                  {isUrgent ? '🔥' : '⌛'}
                </Text>
                <Text
                  className={styles.metaValue}
                  style={{ color: isUrgent ? '#FF5252' : undefined }}
                >
                  {formatCountdown(countdownMins)}后
                </Text>
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

            <View className={styles.tagsRow}>
              <View
                className={classnames(
                  styles.extraTag,
                  req.hasLuggage !== undefined
                    ? req.hasLuggage
                      ? styles.tagActive
                      : styles.tagInactive
                    : styles.tagInactive
                )}
              >
                <Text>🧳</Text>
                <Text>{req.hasLuggage === undefined ? '行李?' : req.hasLuggage ? '有行李' : '无行李'}</Text>
              </View>
              <View
                className={classnames(
                  styles.extraTag,
                  req.acceptCarpool !== undefined
                    ? req.acceptCarpool
                      ? styles.tagActive
                      : styles.tagInactive
                    : styles.tagInactive
                )}
              >
                <Text>🚗</Text>
                <Text>
                  {req.acceptCarpool === undefined ? '拼车?' : req.acceptCarpool ? '可拼车' : '不拼车'}
                </Text>
              </View>
              <View
                className={classnames(
                  styles.extraTag,
                  req.needFemaleDriver !== undefined
                    ? req.needFemaleDriver
                      ? styles.tagActive
                      : styles.tagInactive
                    : styles.tagInactive
                )}
              >
                <Text>👩</Text>
                <Text>
                  {req.needFemaleDriver === undefined
                    ? '女司机?'
                    : req.needFemaleDriver
                    ? '女司机'
                    : '不要求'}
                </Text>
              </View>
            </View>

            {req.remark && (
              <View className={styles.remarkBox}>
                <Text className={styles.remarkLabel}>📝 主持人备注</Text>
                <Text className={styles.remarkText}>{req.remark}</Text>
              </View>
            )}

            {missing.length > 0 && (
              <View style={{ marginBottom: '24rpx' }}>
                <WarningTip fields={missing} />
              </View>
            )}

            <View className={styles.inputSection}>
              <View className={styles.inputRow}>
                <View className={styles.inputLabel}>
                  <Text className={styles.required}>*</Text>
                  <Text>预算</Text>
                </View>
                <View className={styles.inputBox}>
                  <Text className={styles.prefix}>¥</Text>
                  <Input
                    className={styles.input}
                    type="number"
                    placeholder="输入金额"
                    value={req.budget ? String(req.budget) : budgets[req.id] || ''}
                    disabled={!!req.budget}
                    onInput={(e) => handleBudgetChange(req.id, e.detail.value)}
                  />
                  <Text className={styles.suffix}>元</Text>
                </View>
                {!req.budget && (
                  <View className={styles.quickBudget}>
                    {quickBudgets.map((b) => (
                      <View
                        key={b}
                        className={styles.quickBudgetBtn}
                        onClick={() => handleQuickBudget(req.id, b)}
                      >
                        <Text>{b}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              <View className={styles.inputRow}>
                <View className={styles.inputLabel}>
                  <Text className={styles.required}>*</Text>
                  <Text>联系电话</Text>
                </View>
                <View className={styles.inputBox}>
                  <Input
                    className={styles.input}
                    type="tel"
                    placeholder="前台/主持人电话"
                    value={req.contactPhone || phones[req.id] || ''}
                    disabled={!!req.contactPhone}
                    maxlength={11}
                    onInput={(e) => handlePhoneChange(req.id, e.detail.value)}
                  />
                </View>
              </View>
            </View>

            <View
              style={{
                padding: '8px 12px',
                background: 'rgba(45,91,255,0.04)',
                borderRadius: '8px',
                marginBottom: '16rpx',
                fontSize: '12rpx',
                color: '#5B6380',
                lineHeight: 1.6
              }}
            >
              📋 {generateCarpoolSummary(req)}
            </View>

            <View className={styles.actionRow}>
              <Button className={styles.btnCancel} onClick={() => handleCancel(req)}>
                取消
              </Button>
              <Button
                className={classnames(
                  styles.btnPublish,
                  !canPublish(req) && styles.btnPublishDisabled
                )}
                disabled={!canPublish(req)}
                onClick={() => handlePublish(req)}
              >
                发布到车源池
              </Button>
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default PendingPage;
