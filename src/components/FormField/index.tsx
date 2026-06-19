import React from 'react';
import { View, Text, Input, Textarea } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

type FieldType = 'select' | 'options' | 'number' | 'input' | 'textarea' | 'picker';

interface FormFieldProps {
  label: string;
  type?: FieldType;
  required?: boolean;
  hint?: string;
  placeholder?: string;
  value?: string | number;
  valueDisplay?: string;
  options?: Array<{ id: string; name: string; sub?: string; emoji?: string }>;
  activeOptionIds?: string[];
  numberMin?: number;
  numberMax?: number;
  numberUnit?: string;
  inputType?: 'text' | 'number' | 'tel';
  textareaMax?: number;
  onSelect?: () => void;
  onOptionChange?: (id: string) => void;
  onNumberChange?: (value: number) => void;
  onInputChange?: (value: string) => void;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  type = 'select',
  required = false,
  hint,
  placeholder,
  value,
  valueDisplay,
  options = [],
  activeOptionIds = [],
  numberMin = 1,
  numberMax = 99,
  numberUnit,
  inputType = 'text',
  textareaMax = 200,
  onSelect,
  onOptionChange,
  onNumberChange,
  onInputChange
}) => {
  const displayValue = valueDisplay ?? (value !== undefined && value !== null ? String(value) : '');

  const handleDec = () => {
    if (!onNumberChange) return;
    const cur = typeof value === 'number' ? value : numberMin;
    const next = Math.max(numberMin, cur - 1);
    onNumberChange(next);
  };

  const handleInc = () => {
    if (!onNumberChange) return;
    const cur = typeof value === 'number' ? value : numberMin;
    const next = Math.min(numberMax, cur + 1);
    onNumberChange(next);
  };

  return (
    <View className={styles.field}>
      <View className={styles.label}>
        <Text className={styles.labelText}>
          {required && <Text className={styles.required}>*</Text>}
          {label}
        </Text>
        {hint && <Text className={styles.hint}>{hint}</Text>}
      </View>

      {type === 'select' && (
        <View
          className={classnames(styles.valueBox, !!displayValue && styles.active)}
          onClick={onSelect}
        >
          {displayValue ? (
            <Text className={styles.value}>{displayValue}</Text>
          ) : (
            <Text className={styles.placeholder}>{placeholder || '请选择'}</Text>
          )}
          <Text className={styles.arrow}>›</Text>
        </View>
      )}

      {type === 'options' && (
        <View className={styles.optionsGrid}>
          {options.map((opt) => {
            const isActive = activeOptionIds.includes(opt.id);
            return (
              <View
                key={opt.id}
                className={classnames(styles.optionItem, isActive && styles.optionActive)}
                onClick={() => onOptionChange?.(opt.id)}
              >
                {opt.emoji && <Text>{opt.emoji}</Text>}
                <Text>{opt.name}</Text>
                {opt.sub && isActive && <Text>✓</Text>}
              </View>
            );
          })}
        </View>
      )}

      {type === 'number' && (
        <View className={styles.inputRow}>
          <View className={styles.numberBtn} onClick={handleDec}>
            <Text>−</Text>
          </View>
          <Text className={styles.numberValue}>
            {value}
            {numberUnit && <Text className={styles.numberUnit}>{numberUnit}</Text>}
          </Text>
          <View className={styles.numberBtn} onClick={handleInc}>
            <Text>+</Text>
          </View>
        </View>
      )}

      {type === 'input' && (
        <Input
          className={styles.inputField}
          type={inputType}
          placeholder={placeholder}
          value={String(value || '')}
          onInput={(e) => onInputChange?.(e.detail.value)}
        />
      )}

      {type === 'textarea' && (
        <Textarea
          className={styles.textareaField}
          placeholder={placeholder}
          value={String(value || '')}
          maxlength={textareaMax}
          onInput={(e) => onInputChange?.(e.detail.value)}
        />
      )}
    </View>
  );
};

export default FormField;
