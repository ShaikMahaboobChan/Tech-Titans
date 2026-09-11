export type VerificationStatus = 'verified' | 'compromised' | 'warning' | 'pending' | 'information';

export type UserRole = 'ADMIN' | 'DEFENCE AUDITOR' | 'ML SEC-OPS';

export interface Contributor {
  id: string;
  name: string;
  organization: string;
  role: 'DATA PROVIDER' | 'MODEL PROVIDER' | 'ANALYST' | 'AUDITOR';
  publicKey: string;
  verifiedStatus: 'verified' | 'pending';
  registeredDate: string;
  artifactsCount: number;
}

export interface DatasetItem {
  id: string;
  name: string;
  version: string;
  contributor: string;
  contributorId: string;
  sha256: string;
  expectedSha256: string;
  size: string;
  fileCount: number;
  fileType: string;
  resolution: string;
  uploadSource: string;
  createdDate: string;
  status: VerificationStatus;
  description: string;
  tampered?: boolean;
}

export interface ModelVersion {
  version: string;
  sha256: string;
  registeredDate: string;
  isActive: boolean;
  status: VerificationStatus;
  notes: string;
}

export interface ModelItem {
  id: string;
  name: string;
  version: string;
  framework: string;
  architecture: string;
  contributor: string;
  contributorId: string;
  sha256: string;
  expectedSha256: string;
  registeredDate: string;
  status: VerificationStatus;
  activeVersion: string;
  versions: ModelVersion[];
  accuracy: number;
  description: string;
  tampered?: boolean;
}

export interface BoundingBox {
  id: string;
  label: string;
  confidence: number;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage 0-100
  height: number; // percentage 0-100
  classification: 'Hostile' | 'Friendly' | 'Neutral' | 'Unknown';
}

export interface InferenceItem {
  id: string;
  pipelineId: string;
  name: string;
  modelId: string;
  modelVersion: string;
  datasetId: string;
  inputImageName: string;
  inputImageUrl: string;
  inputSha256: string;
  modelSha256: string;
  outputSha256: string;
  expectedOutputSha256: string;
  timestamp: string;
  status: VerificationStatus;
  detections: BoundingBox[];
  processingTimeMs: number;
  tampered?: boolean;
}

export interface AuditBlock {
  blockNumber: number;
  timestamp: string;
  eventType: string;
  artifactType: 'Dataset' | 'Model' | 'Inference' | 'Verification';
  artifactId: string;
  contributor: string;
  previousHash: string;
  currentHash: string;
  expectedHash: string;
  signature: string;
  status: VerificationStatus;
  tampered?: boolean;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  eventType: string;
  artifact: string;
  artifactId: string;
  contributor: string;
  status: VerificationStatus;
  details: string;
}

export interface VerificationCheckStep {
  id: string;
  name: string;
  target: string;
  status: VerificationStatus;
  expectedHash?: string;
  actualHash?: string;
  message: string;
  details: string;
}

export interface VerificationResult {
  pipelineId: string;
  timestamp: string;
  isTrusted: boolean;
  overallStatus: 'TRUSTED' | 'INTEGRITY COMPROMISED';
  score: number; // e.g. 98 or 42
  verdictReason: string;
  steps: VerificationCheckStep[];
  mismatchDetails?: {
    artifactType: string;
    artifactId: string;
    expectedHash: string;
    actualHash: string;
    reason: string;
    affectedArtifacts: string[];
  };
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: number;
}

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  organization: string;
  clearanceLevel: string;
  avatarUrl?: string;
  lastLogin: string;
}

export interface LoginCredentials {
  identifier: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

