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
  
  const getIcon = () => {
    const iconProps = { sx: { fontSize: 48, mb: 1 } };
    
    switch (config.type) {
      case 'success':
        return <SuccessIcon {...iconProps} color="success" />;
      case 'warning':
        return <WarningIcon {...iconProps} color="warning" />;
      case 'error':
        return <ErrorIcon {...iconProps} color="error" />;
      case 'confirm':
        return <ConfirmIcon {...iconProps} color="primary" />;
      default:
        return <InfoIcon {...iconProps} color="info" />;
    }
  };

  const getIconColor = () => {
    switch (config.type) {
      case 'success':
        return theme.palette.success.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'error':
        return theme.palette.error.main;
      case 'confirm':
        return theme.palette.primary.main;
      default:
        return theme.palette.info.main;
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
          borderRadius: 2,
          p: 1
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {getIcon()}
          <Typography variant="h6" component="div" sx={{ color: getIconColor(), fontWeight: 600 }}>
            {config.title}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ textAlign: 'center', pt: 0 }}>
        <Typography variant="body1" sx={{ px: 2, pb: 2 }}>
          {config.message}
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
        {config.type === 'confirm' && (
          <Button
            onClick={handleCancel}
            variant="outlined"
            color="grey"
            sx={{ mr: 1, minWidth: 100 }}
          >
            {config.cancelText}
          </Button>
        )}
        <Button
          onClick={handleConfirm}
          variant="contained"
          color={config.type === 'error' ? 'error' : config.type === 'success' ? 'success' : config.type === 'warning' ? 'warning' : 'primary'}
          sx={{ minWidth: 100 }}
        >
          {config.confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomModal;