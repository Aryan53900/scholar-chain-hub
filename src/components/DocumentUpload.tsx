import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle, 
  AlertCircle,
  Download
} from 'lucide-react';

interface DocumentUploadProps {
  applicationId?: string;
  userId: string;
  onUploadComplete?: (fileUrls: string[]) => void;
  existingDocuments?: string[];
  isReadOnly?: boolean;
}

interface FileWithProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  url?: string;
}

export default function DocumentUpload({ 
  applicationId, 
  userId, 
  onUploadComplete, 
  existingDocuments = [],
  isReadOnly = false 
}: DocumentUploadProps) {
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png', 
    'image/jpg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    const validFiles = selectedFiles.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type.`,
          variant: "destructive",
        });
        return false;
      }
      
      if (file.size > maxFileSize) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the 10MB limit.`,
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    });

    const newFiles: FileWithProgress[] = validFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const
    }));

    setFiles(prev => [...prev, ...newFiles]);
    uploadFiles(newFiles);
  };

  const uploadFiles = async (filesToUpload: FileWithProgress[]) => {
    setIsUploading(true);
    const uploadedUrls: string[] = [];

    for (let i = 0; i < filesToUpload.length; i++) {
      const fileWithProgress = filesToUpload[i];
      const { file } = fileWithProgress;
      
      try {
        // Create file path: userId/applicationId/filename or userId/filename
        const filePath = applicationId 
          ? `${userId}/${applicationId}/${Date.now()}-${file.name}`
          : `${userId}/${Date.now()}-${file.name}`;

        const { data, error } = await supabase.storage
          .from('student-documents')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (error) {
          throw error;
        }

        // Update file status to completed
        setFiles(prev => prev.map((f, idx) => 
          f === fileWithProgress 
            ? { ...f, status: 'completed', progress: 100, url: data.path }
            : f
        ));

        uploadedUrls.push(data.path);

        toast({
          title: "File uploaded",
          description: `${file.name} has been uploaded successfully.`,
        });

      } catch (error: any) {
        setFiles(prev => prev.map((f, idx) => 
          f === fileWithProgress 
            ? { ...f, status: 'error', progress: 0 }
            : f
        ));

        toast({
          title: "Upload failed",
          description: `Failed to upload ${file.name}: ${error.message}`,
          variant: "destructive",
        });
      }
    }

    setIsUploading(false);
    if (uploadedUrls.length > 0 && onUploadComplete) {
      onUploadComplete(uploadedUrls);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('student-documents')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      toast({
        title: "Download failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getFileIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <FileText className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {!isReadOnly && (
        <div className="space-y-2">
          <Label>Upload Documents</Label>
          <div 
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Click to upload documents (PDF, DOC, DOCX, JPG, PNG)
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Maximum file size: 10MB
            </p>
          </div>
          <Input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* Existing Documents */}
      {existingDocuments.length > 0 && (
        <div className="space-y-2">
          <Label>Uploaded Documents</Label>
          <div className="space-y-2">
            {existingDocuments.map((filePath, index) => {
              const fileName = filePath.split('/').pop() || 'Document';
              return (
                <Card key={index}>
                  <CardContent className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{fileName}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadFile(filePath, fileName)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Current Upload Progress */}
      {files.length > 0 && (
        <div className="space-y-2">
          <Label>Uploading Files</Label>
          <div className="space-y-2">
            {files.map((fileWithProgress, index) => (
              <Card key={index}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getFileIcon(fileWithProgress.status)}
                      <span className="text-sm">{fileWithProgress.file.name}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {fileWithProgress.status === 'uploading' && (
                    <Progress value={fileWithProgress.progress} className="h-2" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
