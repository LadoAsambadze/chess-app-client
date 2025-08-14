import { type ReactNode, useMemo } from 'react';
import {
  Button as MuiButton,
  CircularProgress,
  type ButtonProps as MuiButtonProps,
} from '@mui/material';

type Variant = 'contained' | 'outlined' | 'text';
type ColorType = 'primary' | 'secondary' | 'success' | 'error' | 'warning';

interface ButtonProps
  extends Omit<MuiButtonProps, 'color' | 'variant' | 'disabled'> {
  variant?: Variant;
  colorVariant?: ColorType;
  loading?: boolean;
  disabled?: boolean;
  children: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'contained',
  colorVariant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  children,
  sx,
  ...props
}) => {
  const spinnerSize = useMemo(() => {
    switch (size) {
      case 'small':
        return 16;
      case 'medium':
        return 18;
      case 'large':
        return 20;
      default:
        return 18;
    }
  }, [size]);

  return (
    <MuiButton
      variant={variant}
      color={colorVariant}
      size={size}
      disabled={disabled || loading}
      sx={{ textTransform: 'none', ...sx }}
      {...props}
    >
      {loading && (
        <CircularProgress
          size={spinnerSize}
          color="inherit"
          sx={{ mr: 1 }}
          data-testid="button-loading-spinner"
        />
      )}
      {children}
    </MuiButton>
  );
};
