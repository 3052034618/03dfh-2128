import React, { useState, useMemo } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import dayjs from 'dayjs';
import FormField from '@/components/FormField';
import CountdownCard from '@/components/CountdownCard';
import WarningTip from '@/components/WarningTip';
import { useCarpoolStore } from '@/store/carpoolStore';
import {
  checkMissingFields,
  generateCarpoolSummary,
  addMinutes,
  formatTime,
  getDestinationLabel,
  getDestinationEmoji
} from '@/utils/format';
import type { DestinationType, CarpoolRequest, MissingField, DestinationOption } from '@/types/carpool';
import styles from './index.module.scss';

const timePresets = [
  { minutes: 60, label: '约1小时后' },
  { minutes: 90, label: '约1.5小时后' },
  { minutes: 120, label: '约2小时后' },
  { minutes: 150, label: '约2.5小时后' },
  { minutes: 180, label: '约3小时后' },
  { minutes: 240, label: '约4小时后' }
];

const SendoffPage: React.FC = () => {
  const rooms = useCarpoolStore((s) => s.rooms);
  const dms = useCarpoolStore((s) => s.dms);
  const destinations = useCarpoolStore((s) => s.destinations);
  const reminders = useCarpoolStore((s) => s.getActiveReminders());
  const addRequest = useCarpoolStore((s) => s.addRequest);

  const [roomId, setRoomId] = useState<string>('');
  const [dmId, setDmId] = useState<string>('');
  const [playerCount, setPlayerCount] = useState<number>(6);
  const [endTime, setEndTime] = useState<string>('');
  const [destId, setDestId] = useState<string>('');
  const [hasLuggage, setHasLuggage] = useState<boolean | undefined>(undefined);
  const [acceptCarpool, setAcceptCarpool] = useState<boolean | undefined>(undefined);
  const [needFemaleDriver, setNeedFemaleDriver] = useState<boolean | undefined>(undefined);
  const [remark, setRemark] = useState<string>('');

  const selectedRoom = rooms.find((r) => r.id === roomId);
  const selectedDm = dms.find((d) => d.id === dmId);
  const selectedDest = destinations.find((d) => d.id === destId);

  const destinationsGrouped = useMemo(() => {
    const groups: Record<DestinationType, DestinationOption[]> = {
      subway: [],
      university: [],
      hotel: [],
      mall: [],
      custom: []
    };
    destinations.forEach((d) => {
      if (groups[d.type]) groups[d.type].push(d);
    });
    return groups;
  }, [destinations]);

  const partialReq: Partial<CarpoolRequest> = useMemo(
    () => ({
      roomId,
      dmId,
      playerCount,
      estimatedEndTime: endTime,
      destinationId: destId,
      hasLuggage,
      acceptCarpool,
      needFemaleDriver,
      status: 'draft'
    }),
    [roomId, dmId, playerCount, endTime, destId, hasLuggage, acceptCarpool, needFemaleDriver]
  );

  const missingFields: MissingField[] = useMemo(
    () => checkMissingFields(partialReq),
    [partialReq]
  );

  const canSubmit = roomId && dmId && playerCount > 0 && endTime && destId;

  const summaryText = useMemo(() => {
    if (!canSubmit) return '请先完成基础信息选择...';
    const tempReq: CarpoolRequest = {
      id: 'preview',
      roomId,
      roomName: selectedRoom?.name || '',
      dmId,
      dmName: selectedDm?.name || '',
      playerCount,
      estimatedEndTime: endTime,
      destinationId: destId,
      destinationName: selectedDest?.name || '',
      destinationType: selectedDest?.type || 'custom',
      hasLuggage,
      acceptCarpool,
      needFemaleDriver,
      remark: remark || undefined,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'host'
    };
    return generateCarpoolSummary(tempReq);
  }, [
    canSubmit,
    roomId,
    dmId,
    playerCount,
    endTime,
    destId,
    selectedRoom,
    selectedDm,
    selectedDest,
    hasLuggage,
    acceptCarpool,
    needFemaleDriver,
    remark
  ]);

  const handleFieldClick = (key: MissingField['key']) => {
    const map: Record<string, string> = {
      luggage: '附加选项',
      carpool: '附加选项',
      femaleDriver: '附加选项'
    };
    if (map[key]) {
      Taro.showToast({ title: `请在${map[key]}区域填写`, icon: 'none' });
    }
  };

  const handleSubmit = () => {
    if (!canSubmit) {
      Taro.showToast({ title: '请先完成必填项', icon: 'none' });
      return;
    }
    if (!selectedRoom || !selectedDm || !selectedDest) return;

    addRequest({
      roomId,
      roomName: selectedRoom.name,
      dmId,
      dmName: selectedDm.name,
      playerCount,
      estimatedEndTime: endTime,
      destinationId: destId,
      destinationName: selectedDest.name,
      destinationType: selectedDest.type,
      hasLuggage,
      acceptCarpool,
      needFemaleDriver,
      remark: remark || undefined,
      createdBy: 'host'
    });

    Taro.showToast({ title: '已提交前台审核', icon: 'success' });
    setTimeout(() => {
      setRoomId('');
      setDmId('');
      setPlayerCount(6);
      setEndTime('');
      setDestId('');
      setHasLuggage(undefined);
      setAcceptCarpool(undefined);
      setNeedFemaleDriver(undefined);
      setRemark('');
    }, 800);
  };

  const greeting = useMemo(() => {
    const hour = dayjs().hour();
    if (hour < 12) return '早上好';
    if (hour < 18) return '下午好';
    return '晚上好';
  }, []);

  return (
    <View className={styles.pageContainer}>
      <View className={styles.headerGreeting}>
        <Text className={styles.greetingTitle}>{greeting}，开工啦 👋</Text>
        <Text className={styles.greetingSub}>快速登记今晚送客用车需求</Text>
      </View>

      {reminders.length > 0 && (
        <View style={{ marginBottom: '16rpx' }}>
          {reminders.slice(0, 2).map((r) => (
            <CountdownCard key={r.id} reminder={r} />
          ))}
        </View>
      )}

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionTitleIcon}>🏠</Text>
            开本信息
          </Text>
        </View>

        <FormField
          label="所在房间"
          required
          type="options"
          options={rooms.map((r) => ({
            id: r.id,
            name: r.theme ? `${r.name}·${r.theme}` : r.name
          }))}
          activeOptionIds={roomId ? [roomId] : []}
          onOptionChange={(id) => setRoomId(id)}
        />

        <FormField
          label="DM 名称"
          required
          type="options"
          options={dms.map((d) => ({ id: d.id, name: d.name }))}
          activeOptionIds={dmId ? [dmId] : []}
          onOptionChange={(id) => setDmId(id)}
        />

        <FormField
          label="玩家人数"
          required
          type="number"
          value={playerCount}
          numberMin={1}
          numberMax={15}
          numberUnit="人"
          onNumberChange={setPlayerCount}
        />
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionTitleIcon}>⏰</Text>
            预计散场时间
          </Text>
          <Text className={styles.sectionHint}>半小时步进</Text>
        </View>

        <ScrollView className={styles.timeOptions} scrollX enhanced showScrollbar={false}>
          {timePresets.map((p) => {
            const t = addMinutes(p.minutes);
            const isActive = endTime === t;
            return (
              <View
                key={p.minutes}
                className={classnames(styles.timeItem, isActive && styles.timeItemActive)}
                onClick={() => setEndTime(t)}
              >
                <Text className={styles.timeHour}>{formatTime(t)}</Text>
                <Text className={styles.timeLabel}>{p.label}</Text>
              </View>
            );
          })}
        </ScrollView>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionTitleIcon}>📍</Text>
            目的地
          </Text>
        </View>

        {(['subway', 'university', 'hotel', 'mall'] as DestinationType[]).map((type) => {
          const list = destinationsGrouped[type];
          if (list.length === 0) return null;
          return (
            <View className={styles.destGroup} key={type}>
              <View className={styles.destGroupTitle}>
                <Text className={styles.destGroupEmoji}>{getDestinationEmoji(type)}</Text>
                <Text>{getDestinationLabel(type)}</Text>
              </View>
              <View className={styles.destOptions}>
                {list.map((d) => {
                  const isActive = destId === d.id;
                  return (
                    <View
                      key={d.id}
                      className={classnames(styles.destOption, isActive && styles.destOptionActive)}
                      onClick={() => setDestId(d.id)}
                    >
                      <Text className={styles.destName}>{d.name}</Text>
                      {d.address && <Text className={styles.destAddr}>{d.address}</Text>}
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionTitleIcon}>✨</Text>
            附加选项
          </Text>
          <Text className={styles.sectionHint}>建议全部填写</Text>
        </View>

        <View className={styles.yesNoRow}>
          <View className={styles.yesNoLabel}>
            <Text>🧳</Text>
            <Text>有行李</Text>
          </View>
          <View className={styles.yesNoBtns}>
            <View
              className={classnames(
                styles.yesNoBtn,
                hasLuggage === true && styles.yesNoBtnActive,
                hasLuggage === false && styles.yesNoBtnActiveNo
              )}
              onClick={() => setHasLuggage(true)}
            >
              <Text>是</Text>
            </View>
            <View
              className={classnames(
                styles.yesNoBtn,
                hasLuggage === false && styles.yesNoBtnActive,
                hasLuggage === true && styles.yesNoBtnActiveNo
              )}
              onClick={() => setHasLuggage(false)}
            >
              <Text>否</Text>
            </View>
          </View>
        </View>

        <View className={styles.yesNoRow}>
          <View className={styles.yesNoLabel}>
            <Text>🚗</Text>
            <Text>接受拼车</Text>
          </View>
          <View className={styles.yesNoBtns}>
            <View
              className={classnames(
                styles.yesNoBtn,
                acceptCarpool === true && styles.yesNoBtnActive,
                acceptCarpool === false && styles.yesNoBtnActiveNo
              )}
              onClick={() => setAcceptCarpool(true)}
            >
              <Text>是</Text>
            </View>
            <View
              className={classnames(
                styles.yesNoBtn,
                acceptCarpool === false && styles.yesNoBtnActive,
                acceptCarpool === true && styles.yesNoBtnActiveNo
              )}
              onClick={() => setAcceptCarpool(false)}
            >
              <Text>否</Text>
            </View>
          </View>
        </View>

        <View className={styles.yesNoRow}>
          <View className={styles.yesNoLabel}>
            <Text>👩</Text>
            <Text>需要女司机</Text>
          </View>
          <View className={styles.yesNoBtns}>
            <View
              className={classnames(
                styles.yesNoBtn,
                needFemaleDriver === true && styles.yesNoBtnActive,
                needFemaleDriver === false && styles.yesNoBtnActiveNo
              )}
              onClick={() => setNeedFemaleDriver(true)}
            >
              <Text>是</Text>
            </View>
            <View
              className={classnames(
                styles.yesNoBtn,
                needFemaleDriver === false && styles.yesNoBtnActive,
                needFemaleDriver === true && styles.yesNoBtnActiveNo
              )}
              onClick={() => setNeedFemaleDriver(false)}
            >
              <Text>否</Text>
            </View>
          </View>
        </View>

        <FormField
          label="特殊备注"
          type="textarea"
          value={remark}
          placeholder="例如：生日蛋糕、外地游客、恐怖本情绪波动等"
          textareaMax={100}
          onInputChange={setRemark}
        />
      </View>

      <WarningTip fields={missingFields} onFieldClick={handleFieldClick} />

      <View className={styles.summaryCard} style={{ marginTop: '24rpx' }}>
        <Text className={styles.summaryTitle}>📋 需求预览</Text>
        <Text className={styles.summaryText}>{summaryText}</Text>
      </View>

      <View className={styles.bottomBar}>
        <Button
          className={classnames(styles.submitBtn, !canSubmit && styles.submitBtnDisabled)}
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          提交前台审核
        </Button>
      </View>
    </View>
  );
};

export default SendoffPage;
