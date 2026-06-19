import React, { useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import CountdownCard from '@/components/CountdownCard';
import { useCarpoolStore } from '@/store/carpoolStore';
import { formatTime, formatCountdown, getCountdownMinutes } from '@/utils/format';
import type { RoleType, CountdownReminder } from '@/types/carpool';
import styles from './index.module.scss';

const MinePage: React.FC = () => {
  const currentRole = useCarpoolStore((s) => s.currentRole);
  const setRole = useCarpoolStore((s) => s.setRole);
  const requests = useCarpoolStore((s) => s.requests);
  const reminders = useCarpoolStore((s) => s.getActiveReminders());
  const upcomingReminders = useCarpoolStore((s) => s.getUpcomingReminders(30));
  const resetToMock = useCarpoolStore((s) => s.resetToMock);

  const laterReminders = useMemo(() => {
    const upcomingIds = new Set(upcomingReminders.map((r) => r.id));
    return reminders.filter((r) => !upcomingIds.has(r.id));
  }, [reminders, upcomingReminders]);

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todayReqs = requests.filter(
      (r) => new Date(r.createdAt).toDateString() === today
    );
    return {
      total: todayReqs.length,
      pending: todayReqs.filter((r) => r.status === 'pending').length,
      completed: todayReqs.filter((r) => r.status === 'completed' || r.status === 'published').length
    };
  }, [requests]);

  const handleRoleChange = (role: RoleType) => {
    setRole(role);
    Taro.showToast({
      title: `已切换为${role === 'host' ? '主持人' : '前台'}模式`,
      icon: 'none'
    });
  };

  const handleMenuItem = (key: string) => {
    const map: Record<string, () => void> = {
      rooms: () => Taro.switchTab({ url: '/pages/pool/index' }),
      feedback: () => Taro.showToast({ title: '请联系管理员', icon: 'none' }),
      about: () =>
        Taro.showModal({
          title: '关于',
          content: '剧本杀用车助手 v1.0\n专为门店定制的高效用车登记工具',
          showCancel: false
        }),
      clear: () => {
        Taro.showModal({
          title: '重置演示数据',
          content: '确定重置为初始演示数据吗？',
          success: (res) => {
            if (res.confirm) {
              resetToMock();
              Taro.showToast({ title: '已重置', icon: 'success' });
            }
          }
        });
      }
    };
    map[key]?.();
  };

  return (
    <View className={styles.pageContainer}>
      <View className={styles.profileCard}>
        <View className={styles.profileHeader}>
          <View className={styles.avatar}>
            <Text>{currentRole === 'host' ? '🎭' : '💼'}</Text>
          </View>
          <View className={styles.profileInfo}>
            <Text className={styles.userName}>
              {currentRole === 'host' ? '主持人工作台' : '前台管理台'}
            </Text>
            <View className={styles.roleLabel}>
              <Text>{currentRole === 'host' ? '主持人' : '前台'}</Text>
              <Text>账号</Text>
            </View>
          </View>
        </View>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{stats.total}</Text>
            <Text className={styles.statLabel}>今日提交</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{stats.pending}</Text>
            <Text className={styles.statLabel}>待审核</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{stats.completed}</Text>
            <Text className={styles.statLabel}>已处理</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>👤</Text>
            角色切换
          </Text>
        </View>
        <View className={styles.roleSelector}>
          <View
            className={classnames(
              styles.roleOption,
              currentRole === 'host' && styles.roleOptionActive
            )}
            onClick={() => handleRoleChange('host')}
          >
            <Text className={styles.roleEmoji}>🎭</Text>
            <Text className={styles.roleName}>主持人</Text>
            <Text className={styles.roleDesc}>
              快速登记
              {'\n'}
              用车需求
            </Text>
          </View>
          <View
            className={classnames(
              styles.roleOption,
              currentRole === 'frontdesk' && styles.roleOptionActive
            )}
            onClick={() => handleRoleChange('frontdesk')}
          >
            <Text className={styles.roleEmoji}>💼</Text>
            <Text className={styles.roleName}>前台</Text>
            <Text className={styles.roleDesc}>
              审核发布
              {'\n'}
              调度管理
            </Text>
          </View>
        </View>
      </View>

      {reminders.length > 0 && (
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>
              <Text className={styles.sectionIcon}>⏰</Text>
              倒计时提醒
            </Text>
            <Text style={{ fontSize: '22rpx', color: '#9099B0' }}>{reminders.length}条</Text>
          </View>

          {upcomingReminders.length > 0 && (
            <View style={{ marginBottom: '16rpx' }}>
              {upcomingReminders.map((r) => (
                <CountdownCard key={r.id} reminder={r} />
              ))}
            </View>
          )}

          {laterReminders.length > 0 && (
            <View>
              <View
                style={{
                  fontSize: '22rpx',
                  color: '#9099B0',
                  marginBottom: '12rpx',
                  paddingLeft: '8rpx'
                }}
              >
                稍后提醒 ({laterReminders.length}) · 散场前30分钟自动弹出确认
              </View>
              {laterReminders.map((r) => {
                const minutes = getCountdownMinutes(r.endTime);
                return (
                  <View key={r.id} className={styles.laterReminderItem}>
                    <View className={styles.laterReminderLeft}>
                      <Text className={styles.laterReminderRoom}>{r.roomName}</Text>
                      <Text className={styles.laterReminderDm}>{r.dmName}</Text>
                    </View>
                    <View className={styles.laterReminderRight}>
                      <Text className={styles.laterReminderTime}>{formatTime(r.endTime)}</Text>
                      <Text className={styles.laterReminderCountdown}>
                        {formatCountdown(minutes)}后
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>📖</Text>
            使用指南
          </Text>
        </View>
        <View className={styles.guideList}>
          <View className={styles.guideItem}>
            <View className={styles.guideStep}>
              <Text>1</Text>
            </View>
            <View className={styles.guideContent}>
              <Text className={styles.guideTitle}>主持人登记</Text>
              <Text className={styles.guideDesc}>
                在「今晚送客」页选择房间、DM、人数和目的地，1分钟完成登记
              </Text>
            </View>
          </View>
          <View className={styles.guideItem}>
            <View className={styles.guideStep}>
              <Text>2</Text>
            </View>
            <View className={styles.guideContent}>
              <Text className={styles.guideTitle}>前台审核发布</Text>
              <Text className={styles.guideDesc}>
                在「待发布」页补充预算和电话，一键发布到门店车源池
              </Text>
            </View>
          </View>
          <View className={styles.guideItem}>
            <View className={styles.guideStep}>
              <Text>3</Text>
            </View>
            <View className={styles.guideContent}>
              <Text className={styles.guideTitle}>散场倒计时</Text>
              <Text className={styles.guideDesc}>
                散场前30分钟自动提醒，确认玩家是否真要用车，避免叫车太晚
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.menuList}>
          <View className={styles.menuItem} onClick={() => handleMenuItem('rooms')}>
            <View className={styles.menuIcon}>
              <Text>📋</Text>
            </View>
            <Text className={styles.menuLabel}>查看车源池</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem} onClick={() => handleMenuItem('feedback')}>
            <View className={styles.menuIcon}>
              <Text>💬</Text>
            </View>
            <Text className={styles.menuLabel}>意见反馈</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem} onClick={() => handleMenuItem('about')}>
            <View className={styles.menuIcon}>
              <Text>ℹ️</Text>
            </View>
            <Text className={styles.menuLabel}>关于版本</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem} onClick={() => handleMenuItem('clear')}>
            <View className={styles.menuIcon}>
              <Text>🗑️</Text>
            </View>
            <Text className={styles.menuLabel}>重置演示数据</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>
      </View>

      <View className={styles.footer}>
        <Text>剧本杀用车助手 · 让送客更省心</Text>
      </View>
    </View>
  );
};

export default MinePage;
