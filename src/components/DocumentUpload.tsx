import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Upload, X, FileText, Loader2 } from 'lucide-react';

interface FileUploadProps {
  applicationId?: string;
  userId: string;
  onFilesUploaded?: (filePaths: string[]) => void;
  existingFiles?: string[];
  maxFiles?: number;
  acceptedTypes?: string[];
}

export function DocumentUpload({ 
  applicationId, 
  userId, 
  onFilesUploaded,
  existingFiles = [],
  maxFiles = 5,
  acceptedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>(existingFiles);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (uploadedFiles.length + files.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const uploadedPaths: string[] = [];

    try {
      for (const file of files) {
        // Validate file type
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!acceptedTypes.includes(fileExtension)) {
          toast({
            title: "Invalid file type",
            description: `File ${file.name} is not supported. Allowed types: ${acceptedTypes.join(', ')}`,
            variant: "destructive",
          });
          continue;
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `File ${file.name} exceeds 10MB limit`,
            variant: "destructive",
          });
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = applicationId 
          ? `${userId}/${applicationId}/${fileName}`
          : `${userId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('student-documents')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast({
            title: "Upload failed",
            description: `Failed to upload ${file.name}`,
            variant: "destructive",
          });
        } else {
          uploadedPaths.push(filePath);
        }
      }

      if (uploadedPaths.length > 0) {
        const newFiles = [...uploadedFiles, ...uploadedPaths];
        setUploadedFiles(newFiles);
        onFilesUploaded?.(newFiles);
        
        toast({
          title: "Upload successful",
          description: `${uploadedPaths.length} file(s) uploaded successfully`,
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = async (filePath: string) => {
    try {
      const { error } = await supabase.storage
        .from('student-documents')
        .remove([filePath]);

      if (error) {
        toast({
          title: "Delete failed",
          description: "Failed to delete file",
          variant: "destructive",
        });
      } else {
        const newFiles = uploadedFiles.filter(f => f !== filePath);
        setUploadedFiles(newFiles);
        onFilesUploaded?.(newFiles);
        
        toast({
          title: "File deleted",
          description: "File removed successfully",
        });
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const getFileName = (filePath: string) => {
    return filePath.split('/').pop() || filePath;
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="documents">Upload Documents</Label>
        <p className="text-sm text-muted-foreground mb-2">
          Accepted formats: {acceptedTypes.join(', ')} (Max 10MB each, {maxFiles} files total)
        </p>
        
        <div className="flex items-center gap-2">
          <Input
            ref={fileInputRef}
            id="documents"
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileUpload}
            disabled={uploading || uploadedFiles.length >= maxFiles}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || uploadedFiles.length >= maxFiles}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Choose Files ({uploadedFiles.length}/{maxFiles})
              </>
            )}
          </Button>
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <Label>Uploaded Documents</Label>
          <div className="space-y-2">
            {uploadedFiles.map((filePath, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm truncate max-w-[200px]">
                    {getFileName(filePath)}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(filePath)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}