import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  useTheme
} from '@mui/material';
import {
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  HelpOutline as ConfirmIcon
} from '@mui/icons-material';

const CustomModal = ({ config, onClose }) => {
  const theme = useTheme();
  
  const getModalStyles = () => {
    switch (config.type) {
      case 'success':
        return {
          borderColor: '#10b981',
          bgColor: '#ecfdf5',
          iconColor: '#10b981',
          titleColor: '#065f46',
          textColor: '#047857'
        };
      case 'warning':
        return {
          borderColor: '#f59e0b',
          bgColor: '#fffbeb',
          iconColor: '#f59e0b',
          titleColor: '#92400e',
          textColor: '#b45309'
        };
      case 'error':
        return {
          borderColor: '#ef4444',
          bgColor: '#fef2f2',
          iconColor: '#ef4444',
          titleColor: '#991b1b',
          textColor: '#dc2626'
        };
      case 'confirm':
        return {
          borderColor: '#3b82f6',
          bgColor: '#eff6ff',
          iconColor: '#3b82f6',
          titleColor: '#1e40af',
          textColor: '#2563eb'
        };
      default:
        return {
          borderColor: '#6366f1',
          bgColor: '#eef2ff',
          iconColor: '#6366f1',
          titleColor: '#3730a3',
          textColor: '#4f46e5'
        };
    }
  };

  const styles = getModalStyles();
  
  const getIcon = () => {
    const iconProps = { 
      sx: { 
        fontSize: 32, 
        color: styles.iconColor
      } 
    };
    
    switch (config.type) {
      case 'success':
        return <SuccessIcon {...iconProps} />;
      case 'warning':
        return <WarningIcon {...iconProps} />;
      case 'error':
        return <ErrorIcon {...iconProps} />;
      case 'confirm':
        return <ConfirmIcon {...iconProps} />;
      default:
        return <InfoIcon {...iconProps} />;
    }
  };

  const handleConfirm = () => {
    if (config.onConfirm) {
      config.onConfirm();
    } else {
      onClose();
    }
  };

  const handleCancel = () => {
    if (config.onCancel) {
      config.onCancel();
    } else {
      onClose();
    }
  };

  return (
    <Dialog
      open={config.isOpen}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          borderTop: `5px solid ${styles.borderColor}`,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          background: '#ffffff',
          overflow: 'visible'
        }
      }}
    >
      {/* Header con icono */}
      <Box
        sx={{
          position: 'absolute',
          top: -32,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: styles.bgColor,
          border: `4px solid #ffffff`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
      >
        {getIcon()}
      </Box>

      <DialogTitle sx={{ textAlign: 'center', pt: 5, pb: 1 }}>
        <Typography 
          variant="h5" 
          component="div" 
          sx={{ 
            color: styles.titleColor, 
            fontWeight: 700,
            fontSize: { xs: '1.25rem', sm: '1.5rem' }
          }}
        >
          {config.title}
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ textAlign: 'center', pt: 1, pb: 2 }}>
        <Typography 
          variant="body1" 
          sx={{ 
            px: { xs: 2, sm: 3 },
            color: '#64748b',
            fontSize: { xs: '0.95rem', sm: '1rem' },
            lineHeight: 1.6
          }}
        >
          {config.message}
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3, gap: 1.5 }}>
        {config.type === 'confirm' && (
          <Button
            onClick={handleCancel}
            variant="outlined"
            sx={{ 
              minWidth: { xs: 100, sm: 120 },
              height: 42,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '0.95rem',
              fontWeight: 600,
              borderColor: '#cbd5e1',
              color: '#64748b',
              '&:hover': {
                borderColor: '#94a3b8',
                background: '#f8fafc'
              }
            }}
          >
            {config.cancelText}
          </Button>
        )}
        <Button
          onClick={handleConfirm}
          variant="contained"
          sx={{ 
            minWidth: { xs: 100, sm: 120 },
            height: 42,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '0.95rem',
            fontWeight: 600,
            background: styles.borderColor,
            boxShadow: `0 4px 6px -1px ${styles.iconColor}40`,
            '&:hover': {
              background: styles.iconColor,
              boxShadow: `0 6px 8px -1px ${styles.iconColor}50`
            }
          }}
        >
          {config.confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomModal;