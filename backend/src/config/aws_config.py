"""
AWS S3 Configuration for GraphMind
Handles file uploads, downloads, and presigned URL generation
"""

import boto3
from botocore.exceptions import ClientError
from src.config.settings import settings
import logging

logger = logging.getLogger(__name__)


class S3Client:
    """AWS S3 client wrapper for document storage operations"""
    
    def __init__(self):
        """Initialize S3 client with AWS credentials"""
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION
        )
        self.bucket_name = settings.S3_BUCKET_NAME
        logger.info(f"S3 Client initialized for bucket: {self.bucket_name}")
        
    def upload_file(self, file_path: str, object_name: str | None = None) -> str:
        """
        Upload a file to S3 bucket
        
        Args:
            file_path: Path to file to upload
            object_name: S3 object name. If not specified, file_path is used
            
        Returns:
            Public URL of uploaded file
            
        Raises:
            ClientError: If upload fails
        """
        if object_name is None:
            object_name = file_path
            
        try:
            self.s3_client.upload_file(
                file_path, 
                self.bucket_name, 
                object_name,
                ExtraArgs={
                    'ContentType': 'application/pdf',
                    'ServerSideEncryption': 'AES256'
                }
            )
            
            # Return public URL
            url = f"https://{self.bucket_name}.s3.{settings.AWS_REGION}.amazonaws.com/{object_name}"
            logger.info(f"File uploaded successfully: {url}")
            return url
            
        except ClientError as e:
            logger.error(f"Error uploading file to S3: {e}")
            raise
            
    def upload_fileobj(self, file_obj, object_name: str, content_type: str = 'application/pdf') -> str:
        """
        Upload a file object to S3 bucket
        
        Args:
            file_obj: File object to upload
            object_name: S3 object name
            content_type: MIME type of file
            
        Returns:
            Public URL of uploaded file
            
        Raises:
            ClientError: If upload fails
        """
        try:
            self.s3_client.upload_fileobj(
                file_obj,
                self.bucket_name,
                object_name,
                ExtraArgs={
                    'ContentType': content_type,
                    'ServerSideEncryption': 'AES256'
                }
            )
            
            url = f"https://{self.bucket_name}.s3.{settings.AWS_REGION}.amazonaws.com/{object_name}"
            logger.info(f"File object uploaded successfully: {url}")
            return url
            
        except ClientError as e:
            logger.error(f"Error uploading file object to S3: {e}")
            raise
            
    def generate_presigned_url(self, object_name: str, expiration: int = 3600) -> str:
        """
        Generate a presigned URL for secure access
        
        Args:
            object_name: S3 object name
            expiration: Time in seconds for the presigned URL to remain valid
            
        Returns:
            Presigned URL as string
            
        Raises:
            ClientError: If URL generation fails
        """
        try:
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': object_name
                },
                ExpiresIn=expiration
            )
            logger.info(f"Presigned URL generated for {object_name}, expires in {expiration}s")
            return url
            
        except ClientError as e:
            logger.error(f"Error generating presigned URL: {e}")
            raise
            
    def delete_file(self, object_name: str) -> bool:
        """
        Delete a file from S3 bucket
        
        Args:
            object_name: S3 object name to delete
            
        Returns:
            True if successful, False otherwise
        """
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=object_name
            )
            logger.info(f"File deleted successfully: {object_name}")
            return True
            
        except ClientError as e:
            logger.error(f"Error deleting file from S3: {e}")
            return False
            
    def file_exists(self, object_name: str) -> bool:
        """
        Check if file exists in S3 bucket
        
        Args:
            object_name: S3 object name
            
        Returns:
            True if file exists, False otherwise
        """
        try:
            self.s3_client.head_object(Bucket=self.bucket_name, Key=object_name)
            return True
        except ClientError:
            return False
            
    def list_files(self, prefix: str = '') -> list:
        """
        List files in S3 bucket
        
        Args:
            prefix: Filter results by prefix
            
        Returns:
            List of file names
        """
        try:
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=prefix
            )
            
            if 'Contents' not in response:
                return []
                
            return [obj['Key'] for obj in response['Contents']]
            
        except ClientError as e:
            logger.error(f"Error listing files from S3: {e}")
            return []
            
    def get_file_metadata(self, object_name: str) -> dict:
        """
        Get metadata for a file in S3
        
        Args:
            object_name: S3 object name
            
        Returns:
            Dictionary with file metadata
        """
        try:
            response = self.s3_client.head_object(
                Bucket=self.bucket_name,
                Key=object_name
            )
            
            return {
                'size': response.get('ContentLength'),
                'content_type': response.get('ContentType'),
                'last_modified': response.get('LastModified'),
                'metadata': response.get('Metadata', {})
            }
            
        except ClientError as e:
            logger.error(f"Error getting file metadata: {e}")
            return {}


# Singleton instance
s3_client = S3Client()
