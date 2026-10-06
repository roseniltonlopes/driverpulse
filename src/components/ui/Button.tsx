import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
  TouchableOpacityProps,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../stores/useThemeStore';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'danger' | 'warning' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  style,
  textStyle,
  ...props
}) => {
  const { colors, isDark } = useTheme();

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return styles.sm;
      case 'lg':
        return styles.lg;
      default:
        return styles.md;
    }
  };

  const getTextSizeStyle = () => {
    switch (size) {
      case 'sm':
        return styles.textSm;
      case 'lg':
        return styles.textLg;
      default:
        return styles.textMd;
    }
  };

  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? colors.primary : '#FFFFFF'}
        />
      ) : (
        <>
          {leftIcon}
          <Text
            style={[
              styles.textBase,
              getTextSizeStyle(),
              variant === 'primary' && { color: '#091A12', fontWeight: '800' },
              (variant === 'danger' || variant === 'warning') && { color: '#FFFFFF' },
              variant === 'secondary' && { color: colors.textPrimary },
              variant === 'outline' && { color: colors.primary },
              variant === 'ghost' && { color: colors.textSecondary },
              leftIcon ? { marginLeft: 8 } : null,
              rightIcon ? { marginRight: 8 } : null,
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon}
        </>
      )}
    </>
  );

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        disabled={disabled || loading}
        style={[styles.gradientWrapper, disabled && styles.disabled, style]}
        {...props}
      >
        <LinearGradient
          colors={colors.primaryGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.button, getSizeStyle(), styles.primaryShadow]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const getVariantStyle = () => {
    switch (variant) {
      case 'danger':
        return { backgroundColor: colors.danger };
      case 'warning':
        return { backgroundColor: colors.warning };
      case 'secondary':
        return {
          backgroundColor: colors.cardElevated,
          borderWidth: 1,
          borderColor: colors.cardBorder,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: colors.primary,
        };
      case 'ghost':
        return { backgroundColor: 'transparent' };
      default:
        return {};
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled || loading}
      style={[
        styles.button,
        getVariantStyle(),
        getSizeStyle(),
        disabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  gradientWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  primaryShadow: {
    shadowColor: '#00E599',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  sm: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  md: {
    paddingVertical: 15,
    paddingHorizontal: 22,
  },
  lg: {
    paddingVertical: 18,
    paddingHorizontal: 26,
  },
  textBase: {
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  textSm: {
    fontSize: 13,
  },
  textMd: {
    fontSize: 15,
  },
  textLg: {
    fontSize: 17,
  },
  disabled: {
    opacity: 0.5,
  },
});
