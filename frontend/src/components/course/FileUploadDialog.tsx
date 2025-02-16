import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { courseService } from '../../services/courseService';

interface FileUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const FileUploadDialog: React.FC<FileUploadDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      const fileType = selectedFile.name.split('.').pop()?.toLowerCase();
      
      if (fileType === 'pdf' || fileType === 'csv') {
        setFile(selectedFile);
        setError('');
      } else {
        setError('只支持上传 PDF 或 CSV 文件');
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('请选择要上传的文件');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const formData = new FormData();
      formData.append('file', file);
      
      await courseService.importCourses(formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || '文件上传失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>上传课表文件</DialogTitle>
      <DialogContent>
        <Box sx={{ textAlign: 'center', py: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <input
            accept=".pdf,.csv"
            style={{ display: 'none' }}
            id="file-upload"
            type="file"
            onChange={handleFileChange}
            disabled={loading}
          />
          <label htmlFor="file-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUploadIcon />}
              disabled={loading}
            >
              选择文件
            </Button>
          </label>
          
          {file && (
            <Typography variant="body1" sx={{ mt: 2 }}>
              已选择: {file.name}
            </Typography>
          )}
          
          {loading && (
            <Box sx={{ mt: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          取消
        </Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          disabled={!file || loading}
        >
          上传
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FileUploadDialog; 