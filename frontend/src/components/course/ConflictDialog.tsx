import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
} from '@mui/material';
import { Warning as WarningIcon, AccessTime as AccessTimeIcon } from '@mui/icons-material';
import { Course } from '../../types/course';

interface ConflictDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  conflictCourses: Course[];
}

const ConflictDialog: React.FC<ConflictDialogProps> = ({
  open,
  onClose,
  onConfirm,
  conflictCourses,
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="error" />
          <Typography variant="h6" color="error.main" sx={{ fontWeight: 600 }}>
            课程时间冲突提醒
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" paragraph sx={{ color: 'text.primary', mb: 3 }}>
          该课程与以下已选课程存在时间冲突：
        </Typography>
        <List sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 1 }}>
          {conflictCourses.map((course, index) => (
            <React.Fragment key={course.id}>
              <ListItem sx={{ px: 3, py: 2 }}>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                      {course.name}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                      <AccessTimeIcon sx={{ fontSize: 18, mr: 1 }} />
                      <Typography variant="body2" component="span">
                        {course.time_slot}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              {index < conflictCourses.length - 1 && (
                <Divider sx={{ opacity: 0.5 }} />
              )}
            </React.Fragment>
          ))}
        </List>
        <Typography 
          variant="body2" 
          color="error" 
          sx={{ 
            mt: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <WarningIcon sx={{ fontSize: 20 }} />
          请注意：选择该课程可能会影响您的学习安排
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: 'rgba(0, 0, 0, 0.12)',
            color: 'text.primary',
            '&:hover': {
              borderColor: 'rgba(0, 0, 0, 0.24)',
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          取消
        </Button>
        <Button 
          onClick={onConfirm} 
          variant="contained" 
          color="error"
          sx={{
            ml: 2,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          }}
        >
          仍然选课
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConflictDialog; 