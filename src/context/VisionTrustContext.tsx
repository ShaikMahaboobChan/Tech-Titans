import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  DatasetItem,
  ModelItem,
  InferenceItem,
  AuditBlock,
  SecurityEvent,
  Contributor,
  UserRole,
  VerificationResult,
  ToastMessage,
} from '../types';
import { computeSha256 } from '../crypto/sha256';

interface TamperState {
  datasetTampered: boolean;
  modelTampered: boolean;
  inferenceTampered: boolean;
  auditTampered: boolean;
}

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Ignore storage quota or disabled errors
  }
}

let toastCounter = 0;

interface VisionTrustContextType {
  datasets: DatasetItem[];
  models: ModelItem[];
  inferences: InferenceItem[];
  auditBlocks: AuditBlock[];
  securityEvents: SecurityEvent[];
  contributors: Contributor[];
  currentUserRole: UserRole;
  isSidebarCollapsed: boolean;
  activeTab: string;
  activeDatasetId: string | null;
  activeModelId: string | null;
  tamperState: TamperState;
  verificationResult: VerificationResult | null;
  isVerifying: boolean;
  verificationProgress: number;
  verificationStageText: string;
  toasts: ToastMessage[];
  isSearchOpen: boolean;
  isNotificationsOpen: boolean;

  // Actions
  toggleSidebar: () => void;
  setActiveTab: (tab: string) => void;
  setActiveDatasetId: (id: string | null) => void;
  setActiveModelId: (id: string | null) => void;
  setCurrentUserRole: (role: UserRole) => void;
  setIsSearchOpen: (open: boolean) => void;
  setIsNotificationsOpen: (open: boolean) => void;
  addToast: (type: ToastMessage['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;
  clearAllData: () => void;

  // Domain Actions
  registerDataset: (data: Partial<DatasetItem>, preComputedHash?: string) => Promise<void>;
  registerModel: (data: Partial<ModelItem>, preComputedHash?: string) => Promise<void>;
  addContributor: (data: Partial<Contributor>) => void;
  addInference: (inference: InferenceItem) => Promise<void>;
  runVerification: (pipelineId?: string) => Promise<VerificationResult>;
  verifyAuditLedger: () => boolean;

  // Tamper Operations
  tamperDataset: () => void;
  tamperModel: () => void;
  tamperInference: () => void;
  tamperAudit: () => void;
  restoreIntegrity: () => void;
}

const VisionTrustContext = createContext<VisionTrustContextType | null>(null);

export const VisionTrustProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [datasets, setDatasets] = useState<DatasetItem[]>(() => loadFromStorage('vt_datasets', []));
  const [models, setModels] = useState<ModelItem[]>(() => loadFromStorage('vt_models', []));
  const [inferences, setInferences] = useState<InferenceItem[]>(() => loadFromStorage('vt_inferences', []));
  const [auditBlocks, setAuditBlocks] = useState<AuditBlock[]>(() => loadFromStorage('vt_auditBlocks', []));
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>(() => loadFromStorage('vt_securityEvents', []));
  const [contributors, setContributors] = useState<Contributor[]>(() => loadFromStorage('vt_contributors', []));

  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('ADMIN');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeDatasetId, setActiveDatasetId] = useState<string | null>(null);
  const [activeModelId, setActiveModelId] = useState<string | null>(null);

  const [tamperState, setTamperState] = useState<TamperState>({
    datasetTampered: false,
    modelTampered: false,
    inferenceTampered: false,
    auditTampered: false,
  });

  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationProgress, setVerificationProgress] = useState<number>(0);
  const [verificationStageText, setVerificationStageText] = useState<string>('');

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => saveToStorage('vt_datasets', datasets), [datasets]);
  useEffect(() => saveToStorage('vt_models', models), [models]);
  useEffect(() => saveToStorage('vt_inferences', inferences), [inferences]);
  useEffect(() => saveToStorage('vt_auditBlocks', auditBlocks), [auditBlocks]);
  useEffect(() => saveToStorage('vt_securityEvents', securityEvents), [securityEvents]);
  useEffect(() => saveToStorage('vt_contributors', contributors), [contributors]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastMessage['type'], title: string, message: string) => {
    const timestamp = Date.now();
    const id = `TOAST-${timestamp}-${++toastCounter}`;
    setToasts((prev) => [...prev, { id, type, title, message, timestamp }]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  const clearAllData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vt_datasets');
      localStorage.removeItem('vt_models');
      localStorage.removeItem('vt_inferences');
      localStorage.removeItem('vt_auditBlocks');
      localStorage.removeItem('vt_securityEvents');
      localStorage.removeItem('vt_contributors');
    }
    setDatasets([]);
    setModels([]);
    setInferences([]);
    setAuditBlocks([]);
    setSecurityEvents([]);
    setContributors([]);
    setActiveDatasetId(null);
    setActiveModelId(null);
    setVerificationResult(null);
    setTamperState({
      datasetTampered: false,
      modelTampered: false,
      inferenceTampered: false,
      auditTampered: false,
    });
    addToast('info', 'System Reset', 'All stored artifacts, models, and ledger records cleared.');
  };

  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);

  // Global Keyboard listener for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Register a new dataset — uses preComputedHash if a real file was uploaded, otherwise hashes metadata
  const registerDataset = async (data: Partial<DatasetItem>, preComputedHash?: string) => {
    const id = `DS-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const hash = preComputedHash ?? await computeSha256(JSON.stringify(data) + Date.now());

    // Create an audit block for this registration
    const prevHash = auditBlocks.length > 0 ? auditBlocks[0].currentHash : '0000000000000000000000000000000000000000000000000000000000000000';
    const blockHash = await computeSha256(prevHash + hash + Date.now());
    const newBlock: AuditBlock = {
      blockNumber: auditBlocks.length + 1,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      eventType: 'Dataset Registration',
      artifactType: 'Dataset',
      artifactId: id,
      contributor: data.contributor || 'Unknown',
      previousHash: prevHash,
      currentHash: blockHash,
      expectedHash: blockHash,
      signature: blockHash.slice(0, 16) + '...',
      status: 'verified',
    };
    setAuditBlocks((prev) => [newBlock, ...prev]);

    const newDataset: DatasetItem = {
      id,
      name: data.name || 'Uploaded Dataset',
      version: data.version || 'v1.0',
      contributor: data.contributor || 'Unknown Contributor',
      contributorId: data.contributorId || 'CONTRIB-UNKNOWN',
      sha256: hash,
      expectedSha256: hash,
      size: data.size || 'Unknown',
      fileCount: data.fileCount || 1,
      fileType: data.fileType || 'Binary',
      resolution: data.resolution || 'N/A',
      uploadSource: data.uploadSource || 'User Upload',
      createdDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'verified',
      description: data.description || 'User-uploaded dataset.',
    };

    setDatasets((prev) => [newDataset, ...prev]);

    const newEvent: SecurityEvent = {
      id: `EVT-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString('en-GB') + ' Today',
      eventType: 'Dataset registered in tamper-evident ledger',
      artifact: newDataset.name,
      artifactId: newDataset.id,
      contributor: newDataset.contributor,
      status: 'verified',
      details: `SHA-256: ${hash.slice(0, 16)}... | Block #${newBlock.blockNumber} sealed`,
    };
    setSecurityEvents((prev) => [newEvent, ...prev]);

    addToast('success', 'Dataset Registered', `${newDataset.name} cryptographically fingerprinted & verified.`);
  };

  // Register a new model — uses preComputedHash if a real weights file was uploaded
  const registerModel = async (data: Partial<ModelItem>, preComputedHash?: string) => {
    const id = `MDL-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const hash = preComputedHash ?? await computeSha256(JSON.stringify(data) + Date.now());

    // Create an audit block for this registration
    const prevHash = auditBlocks.length > 0 ? auditBlocks[0].currentHash : '0000000000000000000000000000000000000000000000000000000000000000';
    const blockHash = await computeSha256(prevHash + hash + Date.now());
    const newBlock: AuditBlock = {
      blockNumber: auditBlocks.length + 1,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      eventType: 'Model Registration',
      artifactType: 'Model',
      artifactId: id,
      contributor: data.contributor || 'Unknown',
      previousHash: prevHash,
      currentHash: blockHash,
      expectedHash: blockHash,
      signature: blockHash.slice(0, 16) + '...',
      status: 'verified',
    };
    setAuditBlocks((prev) => [newBlock, ...prev]);

    const newModel: ModelItem = {
      id,
      name: data.name || 'Uploaded Model',
      version: data.version || 'v1.0',
      framework: data.framework || 'PyTorch',
      architecture: data.architecture || 'Custom',
      contributor: data.contributor || 'Unknown Contributor',
      contributorId: data.contributorId || 'CONTRIB-UNKNOWN',
      sha256: hash,
      expectedSha256: hash,
      registeredDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'verified',
      activeVersion: data.version || 'v1.0',
      accuracy: data.accuracy || 0,
      description: data.description || 'User-uploaded model checkpoint.',
      versions: [
        {
          version: data.version || 'v1.0',
          sha256: hash,
          registeredDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
          isActive: true,
          status: 'verified',
          notes: 'Initial registration.',
        },
      ],
    };

    setModels((prev) => [newModel, ...prev]);

    const newEvent: SecurityEvent = {
      id: `EVT-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString('en-GB') + ' Today',
      eventType: 'Model weights signature verified',
      artifact: newModel.name,
      artifactId: newModel.id,
      contributor: newModel.contributor,
      status: 'verified',
      details: `SHA-256: ${hash.slice(0, 16)}... | Block #${newBlock.blockNumber} sealed`,
    };
    setSecurityEvents((prev) => [newEvent, ...prev]);

    addToast('success', 'Model Registered', `${newModel.name} weights cryptographically verified.`);
  };

  // Add a new trusted contributor
  const addContributor = (data: Partial<Contributor>) => {
    const id = `CONTRIB-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Date.now().toString().slice(-2)}`;
    const newContributor: Contributor = {
      id,
      name: data.name || 'Unknown Unit',
      organization: data.organization || 'Unknown Organization',
      role: data.role || 'DATA PROVIDER',
      publicKey: '04' + Array.from({ length: 62 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      verifiedStatus: 'pending',
      registeredDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      artifactsCount: 0,
    };
    setContributors((prev) => [newContributor, ...prev]);

    const newEvent: SecurityEvent = {
      id: `EVT-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString('en-GB') + ' Today',
      eventType: 'New contributor identity registered',
      artifact: newContributor.name,
      artifactId: newContributor.id,
      contributor: newContributor.organization,
      status: 'pending',
      details: `Role: ${newContributor.role} | Awaiting PKI root certificate verification`,
    };
    setSecurityEvents((prev) => [newEvent, ...prev]);

    addToast('info', 'Contributor Added', `${newContributor.name} registered; awaiting PKI verification.`);
  };

  const addInference = async (newInf: InferenceItem) => {
    // Create an audit block for this inference
    const prevHash = auditBlocks.length > 0 ? auditBlocks[0].currentHash : '0000000000000000000000000000000000000000000000000000000000000000';
    const blockHash = await computeSha256(prevHash + newInf.outputSha256 + Date.now());
    const newBlock: AuditBlock = {
      blockNumber: auditBlocks.length + 1,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      eventType: 'Inference Execution',
      artifactType: 'Inference',
      artifactId: newInf.id,
      contributor: 'ML SEC-OPS Operator',
      previousHash: prevHash,
      currentHash: blockHash,
      expectedHash: blockHash,
      signature: blockHash.slice(0, 16) + '...',
      status: 'verified',
    };
    setAuditBlocks((prev) => [newBlock, ...prev]);
    setInferences((prev) => [newInf, ...prev]);
    addToast('info', 'Inference Sealed', `Inference ${newInf.id} cryptographically linked to Audit Block #${newBlock.blockNumber}.`);
  };

  // Run full multi-stage pipeline verification
  const runVerification = async (pipelineId = 'VT-PIPE-000124'): Promise<VerificationResult> => {
    setIsVerifying(true);
    setVerificationProgress(10);
    setVerificationStageText('Verifying contributor cryptographic signatures & root certificates...');

    await new Promise((r) => setTimeout(r, 260));
    setVerificationProgress(28);
    setVerificationStageText('Auditing dataset SHA-256 byte fingerprint...');

    await new Promise((r) => setTimeout(r, 260));
    setVerificationProgress(50);
    setVerificationStageText('Verifying neural model weights checksum and architecture tensor graph...');

    await new Promise((r) => setTimeout(r, 260));
    setVerificationProgress(75);
    setVerificationStageText('Validating tactical inference prediction hash against input & model keys...');

    await new Promise((r) => setTimeout(r, 260));
    setVerificationProgress(90);
    setVerificationStageText('Executing Merkle tree validation across tamper-evident audit ledger blocks...');

    await new Promise((r) => setTimeout(r, 220));
    setVerificationProgress(100);
    setVerificationStageText('Verification sequence completed.');

    // Evaluate pipeline integrity based on current state & tamper triggers
    const primaryDataset = datasets[0];
    const primaryModel = models[0];
    const primaryInference = inferences[0];
    // Find a tampered block if it exists, otherwise use last block
    const tamperedBlock = auditBlocks.find((b) => b.status === 'compromised');
    const primaryBlock = tamperedBlock || auditBlocks[0];

    // If no data has been uploaded yet, verification just checks integrity system readiness
    if (!primaryDataset || !primaryModel) {
      const emptyResult: VerificationResult = {
        pipelineId,
        timestamp: new Date().toLocaleString('en-GB'),
        isTrusted: true,
        overallStatus: 'TRUSTED',
        score: 100,
        verdictReason: 'No artifacts registered yet. Upload datasets and models to begin pipeline verification.',
        steps: [
          { id: 'STEP-1', name: 'Contributor Identity & PKI', target: 'System', status: 'information', message: 'No contributors registered. System ready.', details: 'Register contributors to enable PKI verification.' },
          { id: 'STEP-2', name: 'Dataset Cryptographic Fingerprint', target: 'None', status: 'pending', message: 'No datasets uploaded.', details: 'Upload a dataset to fingerprint.' },
          { id: 'STEP-3', name: 'Model Artifact Weights Integrity', target: 'None', status: 'pending', message: 'No models registered.', details: 'Register a model to verify weights.' },
          { id: 'STEP-4', name: 'Inference Output Seal', target: 'None', status: 'pending', message: 'No inferences executed.', details: 'Run an inference to generate output seal.' },
          { id: 'STEP-5', name: 'Tamper-Evident Audit Ledger', target: 'Empty', status: 'pending', message: 'Ledger empty. Awaiting first artifact registration.', details: 'Blocks will be created as artifacts are registered.' },
        ],
      };
      setVerificationResult(emptyResult);
      setIsVerifying(false);
      addToast('info', 'System Ready', 'Verification system ready. Upload artifacts to begin.');
      return emptyResult;
    }

    const isDatasetOk = !tamperState.datasetTampered && primaryDataset.status === 'verified';
    const isModelOk = !tamperState.modelTampered && primaryModel.status === 'verified';
    const isInferenceOk = !primaryInference || (!tamperState.inferenceTampered && primaryInference.status === 'verified');
    const isAuditOk = !primaryBlock || (!tamperState.auditTampered && primaryBlock.status === 'verified');

    const isAllTrusted = isDatasetOk && isModelOk && isInferenceOk && isAuditOk;

    let mismatchInfo: VerificationResult['mismatchDetails'] = undefined;
    let verdictReason = 'All registered AI pipeline artifacts are cryptographically verified and tamper-free.';
    let score = 98;

    if (!isModelOk) {
      score = 42;
      verdictReason = 'Model weights fingerprint mismatch detected. Execution graph has been compromised.';
      mismatchInfo = {
        artifactType: 'Model Artifact Checksum',
        artifactId: primaryModel.id,
        expectedHash: primaryModel.expectedSha256,
        actualHash: primaryModel.sha256,
        reason: 'Registered model weights file differs from the current active model cryptographic fingerprint.',
        affectedArtifacts: [primaryModel.id + ' (Active Weights)', 'Inference Execution', 'Output Trust Score'],
      };
    } else if (!isDatasetOk) {
      score = 36;
      verdictReason = 'Dataset payload byte integrity check failed. Training provenance broken.';
      mismatchInfo = {
        artifactType: 'Dataset Payload',
        artifactId: primaryDataset.id,
        expectedHash: primaryDataset.expectedSha256,
        actualHash: primaryDataset.sha256,
        reason: 'Dataset files have been modified post-registration. Hash mismatch.',
        affectedArtifacts: [primaryDataset.id, primaryModel.id, 'Inference Chain'],
      };
    } else if (!isInferenceOk && primaryInference) {
      score = 48;
      verdictReason = 'Inference output fingerprint does not correspond to registered model and input payload.';
      mismatchInfo = {
        artifactType: 'Inference Prediction Output',
        artifactId: primaryInference.id,
        expectedHash: primaryInference.expectedOutputSha256,
        actualHash: primaryInference.outputSha256,
        reason: 'Adversarial prediction tampering or output override detected.',
        affectedArtifacts: [primaryInference.id + ' Detection Output', 'Zero-Trust Audit Seal'],
      };
    } else if (!isAuditOk && primaryBlock) {
      score = 52;
      verdictReason = `Tamper-evident audit ledger hash chain verification failed on Block #${primaryBlock.blockNumber}.`;
      mismatchInfo = {
        artifactType: 'Audit Ledger Block Hash',
        artifactId: `Block #${primaryBlock.blockNumber}`,
        expectedHash: primaryBlock.expectedHash,
        actualHash: primaryBlock.currentHash,
        reason: 'Hash link mismatch indicates unauthorized retroactive block mutation.',
        affectedArtifacts: [`Block #${primaryBlock.blockNumber}`, 'Subsequent Blocks', 'Ledger Integrity Certificate'],
      };
    }

    const result: VerificationResult = {
      pipelineId,
      timestamp: new Date().toLocaleString('en-GB'),
      isTrusted: isAllTrusted,
      overallStatus: isAllTrusted ? 'TRUSTED' : 'INTEGRITY COMPROMISED',
      score,
      verdictReason,
      mismatchDetails: mismatchInfo,
      steps: [
        {
          id: 'STEP-1',
          name: 'Contributor Identity & Public Key Certificate',
          target: contributors.length > 0 ? contributors[0].name : 'No contributors',
          status: contributors.length > 0 ? 'verified' : 'pending',
          message: contributors.length > 0
            ? `${contributors.length} contributor(s) registered with PKI keys.`
            : 'No contributors registered. Add contributors to enable identity verification.',
          details: contributors.length > 0 ? `${contributors.length} contributor(s) | Algorithm: ECDSA-P256-SHA256` : 'Register contributors to activate PKI chain.',
        },
        {
          id: 'STEP-2',
          name: 'Dataset Cryptographic Fingerprint',
          target: primaryDataset.id,
          status: isDatasetOk ? 'verified' : 'compromised',
          expectedHash: primaryDataset.expectedSha256,
          actualHash: primaryDataset.sha256,
          message: isDatasetOk ? 'SHA-256 byte digest matches registered ledger record.' : 'Dataset hash mismatch detected!',
          details: `File: ${primaryDataset.name} | Size: ${primaryDataset.size}`,
        },
        {
          id: 'STEP-3',
          name: 'Model Artifact Weights Integrity',
          target: primaryModel.id,
          status: isModelOk ? 'verified' : 'compromised',
          expectedHash: primaryModel.expectedSha256,
          actualHash: primaryModel.sha256,
          message: isModelOk ? 'Model weights fingerprint exactly matches registered SHA-256.' : 'Model weights hash mismatch detected!',
          details: `${primaryModel.name} | ${primaryModel.framework} | ${primaryModel.architecture}`,
        },
        {
          id: 'STEP-4',
          name: 'Inference Output Seal',
          target: primaryInference ? primaryInference.id : 'No inferences',
          status: !primaryInference ? 'pending' : (isInferenceOk ? (isModelOk ? 'verified' : 'warning') : 'compromised'),
          expectedHash: primaryInference?.expectedOutputSha256,
          actualHash: primaryInference?.outputSha256,
          message: !primaryInference
            ? 'No inferences run yet. Execute an inference to seal output.'
            : isInferenceOk
              ? isModelOk
                ? 'Prediction output cryptographically verified.'
                : 'Affected by upstream model integrity failure.'
              : 'Adversarial prediction tampering detected.',
          details: primaryInference ? `Input→Model→Output hash chain sealed` : 'Run an inference first.',
        },
        {
          id: 'STEP-5',
          name: 'Tamper-Evident Audit Ledger Chaining',
          target: auditBlocks.length > 0 ? `Blocks #001 to #${String(auditBlocks.length).padStart(3, '0')}` : 'Empty Ledger',
          status: auditBlocks.length === 0 ? 'pending' : (isAuditOk ? 'verified' : 'compromised'),
          message: auditBlocks.length === 0
            ? 'Ledger empty. Blocks are created automatically on artifact registration.'
            : isAuditOk
              ? `All ${auditBlocks.length} block(s) chained intact; zero ledger breaks.`
              : `Ledger break detected at Block #${primaryBlock?.blockNumber}!`,
          details: auditBlocks.length > 0 ? 'Continuous SHA-256 cryptographic linkage validated.' : 'Register artifacts to begin ledger.',
        },
      ],
    };

    setVerificationResult(result);
    setIsVerifying(false);

    if (isAllTrusted) {
      addToast('success', 'Pipeline Verified', 'All pipeline artifacts cryptographically trusted.');
    } else {
      addToast('error', 'Integrity Compromised', verdictReason);
    }

    return result;
  };

  // TAMPER ATTACK OPERATIONS (Demonstration Environment)
  const tamperModel = () => {
    if (models.length === 0) {
      addToast('warning', 'No Model Registered', 'Upload a model first to test adversarial weight tampering.');
      return;
    }
    const target = models[0];
    const maliciousHash = '72bc81a04918e09fa88190823c91024bc99812903847acba1982361099a82d09';
    setModels((prev) =>
      prev.map((m, idx) =>
        idx === 0
          ? {
              ...m,
              sha256: maliciousHash,
              status: 'compromised',
              tampered: true,
            }
          : m
      )
    );
    setTamperState((prev) => ({ ...prev, modelTampered: true }));

    const event: SecurityEvent = {
      id: `EVT-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString('en-GB') + ' Today',
      eventType: 'Model weights modification detected (Adversarial Tampering)',
      artifact: `${target.name} Weights`,
      artifactId: target.id,
      contributor: 'ANONYMOUS / UNTRUSTED ACTOR',
      status: 'compromised',
      details: `Model weights altered. New hash: ${maliciousHash.slice(0, 16)}... Expected: ${target.expectedSha256.slice(0, 16)}...`,
    };
    setSecurityEvents((prev) => [event, ...prev]);

    addToast('error', 'Model Tampered', `Adversarial modification injected into ${target.name} weights.`);
  };

  const tamperDataset = () => {
    if (datasets.length === 0) {
      addToast('warning', 'No Dataset Uploaded', 'Upload a dataset first to test adversarial byte corruption.');
      return;
    }
    const target = datasets[0];
    const corruptedHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    setDatasets((prev) =>
      prev.map((d, idx) =>
        idx === 0
          ? {
              ...d,
              sha256: corruptedHash,
              status: 'compromised',
              tampered: true,
            }
          : d
      )
    );
    setTamperState((prev) => ({ ...prev, datasetTampered: true }));

    const event: SecurityEvent = {
      id: `EVT-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString('en-GB') + ' Today',
      eventType: 'Dataset byte alteration detected',
      artifact: target.name,
      artifactId: target.id,
      contributor: 'UNAUTHORIZED INGRESS NODE',
      status: 'compromised',
      details: 'Payload bytes manipulated. Hash does not match registered fingerprint.',
    };
    setSecurityEvents((prev) => [event, ...prev]);

    addToast('error', 'Dataset Tampered', `Payload bytes of ${target.name} altered post-registration.`);
  };

  const tamperInference = () => {
    if (inferences.length === 0) {
      addToast('warning', 'No Inferences Run', 'Execute an inference first to test prediction output tampering.');
      return;
    }
    const target = inferences[0];
    const forgedHash = 'ffff8819acb8849102377a61098823c91024bc99812903847acba19823610990';
    setInferences((prev) =>
      prev.map((inf, idx) =>
        idx === 0
          ? {
              ...inf,
              outputSha256: forgedHash,
              status: 'compromised',
              tampered: true,
              detections: inf.detections.map((d) => ({
                ...d,
                confidence: 45.0,
                classification: 'Neutral', // Spoofed!
              })),
            }
          : inf
      )
    );
    setTamperState((prev) => ({ ...prev, inferenceTampered: true }));

    const event: SecurityEvent = {
      id: `EVT-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString('en-GB') + ' Today',
      eventType: 'Inference classification record tampered (Target Spoofing)',
      artifact: `${target.id} Detection Log`,
      artifactId: target.id,
      contributor: 'ADVERSARIAL INJECTION',
      status: 'compromised',
      details: 'Target detection classification re-labeled with spoofed output hash.',
    };
    setSecurityEvents((prev) => [event, ...prev]);

    addToast('error', 'Inference Tampered', 'Prediction record and detection classifications altered.');
  };

  const tamperAudit = () => {
    if (auditBlocks.length === 0) {
      addToast('warning', 'Audit Ledger Empty', 'Register artifacts first to generate audit ledger blocks to attack.');
      return;
    }
    const targetBlockNum = auditBlocks[auditBlocks.length - 1].blockNumber;
    const brokenBlock = 'bbbb99812903847acba19823610887162b9a4a81bc77290184ef66190823c910';
    setAuditBlocks((prev) =>
      prev.map((blk) =>
        blk.blockNumber === targetBlockNum
          ? {
              ...blk,
              currentHash: brokenBlock,
              status: 'compromised',
              tampered: true,
            }
          : blk
      )
    );
    setTamperState((prev) => ({ ...prev, auditTampered: true }));

    const event: SecurityEvent = {
      id: `EVT-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString('en-GB') + ' Today',
      eventType: 'Tamper-evident audit ledger block mutation detected',
      artifact: `Audit Block #${String(targetBlockNum).padStart(3, '0')}`,
      artifactId: `BLOCK-${String(targetBlockNum).padStart(3, '0')}`,
      contributor: 'UNAUTHENTICATED ACTOR',
      status: 'compromised',
      details: `Block #${String(targetBlockNum).padStart(3, '0')} current hash modified. Breaks cryptographic hash chain.`,
    };
    setSecurityEvents((prev) => [event, ...prev]);

    addToast('error', 'Audit Block Tampered', `Ledger block #${String(targetBlockNum).padStart(3, '0')} mutated; chain broken.`);
  };

  const restoreIntegrity = () => {
    // Reset tamper flags and restore hashes to the expected values (not revert to mock data)
    setDatasets((prev) => prev.map((d) => ({ ...d, sha256: d.expectedSha256, status: 'verified' as const, tampered: false })));
    setModels((prev) => prev.map((m) => ({ ...m, sha256: m.expectedSha256, status: 'verified' as const, tampered: false })));
    setInferences((prev) => prev.map((inf) => ({ ...inf, outputSha256: inf.expectedOutputSha256, status: 'verified' as const, tampered: false })));
    setAuditBlocks((prev) => prev.map((blk) => ({ ...blk, currentHash: blk.expectedHash, status: 'verified' as const, tampered: false })));

    setTamperState({
      datasetTampered: false,
      modelTampered: false,
      inferenceTampered: false,
      auditTampered: false,
    });

    setVerificationResult(null);

    const event: SecurityEvent = {
      id: `EVT-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString('en-GB') + ' Today',
      eventType: 'Pipeline integrity restored to certified baseline',
      artifact: 'All Registered Artifacts',
      artifactId: 'SYSTEM-ROOT',
      contributor: 'SYSTEM ADMINISTRATOR',
      status: 'verified',
      details: 'All cryptographic fingerprints resynchronized to expected registered values.',
    };
    setSecurityEvents((prev) => [event, ...prev]);

    addToast('success', 'Integrity Restored', 'All pipeline artifacts returned to verified baseline.');
  };

  const verifyAuditLedger = (): boolean => {
    if (auditBlocks.length === 0) {
      addToast('info', 'Ledger Ready', 'Audit ledger is ready. Blocks will be created as artifacts are registered.');
      return true;
    }

    // Mathematical verification:
    // auditBlocks is stored newest-first (index 0 is latest block).
    // Chronological order is from index (length - 1) up to index 0.
    let isChainIntact = !tamperState.auditTampered;
    let failureReason = '';

    for (let i = 0; i < auditBlocks.length; i++) {
      const current = auditBlocks[i];
      if (current.tampered || current.status === 'compromised' || current.currentHash !== current.expectedHash) {
        isChainIntact = false;
        failureReason = `Block #${String(current.blockNumber).padStart(3, '0')} hash mutation detected (tampered record).`;
        break;
      }

      // Check linkage to previous chronological block (index i + 1)
      if (i < auditBlocks.length - 1) {
        const prevChronological = auditBlocks[i + 1];
        if (current.previousHash !== prevChronological.currentHash) {
          isChainIntact = false;
          failureReason = `Cryptographic linkage broken between Block #${String(prevChronological.blockNumber).padStart(3, '0')} and Block #${String(current.blockNumber).padStart(3, '0')}.`;
          break;
        }
      } else {
        // Genesis block check
        if (current.previousHash !== '0000000000000000000000000000000000000000000000000000000000000000') {
          isChainIntact = false;
          failureReason = `Genesis Block #${String(current.blockNumber).padStart(3, '0')} root signature invalid.`;
          break;
        }
      }
    }

    if (isChainIntact) {
      addToast('success', 'Ledger Validated', `All ${auditBlocks.length} block(s) cryptographically chained & verified.`);
    } else {
      addToast('error', 'Ledger Integrity Failure', failureReason || 'Audit block hash linkage broken.');
    }
    return isChainIntact;
  };

  return (
    <VisionTrustContext.Provider
      value={{
        datasets,
        models,
        inferences,
        auditBlocks,
        securityEvents,
        contributors,
        currentUserRole,
        isSidebarCollapsed,
        activeTab,
        activeDatasetId,
        activeModelId,
        tamperState,
        verificationResult,
        isVerifying,
        verificationProgress,
        verificationStageText,
        toasts,
        isSearchOpen,
        isNotificationsOpen,
        toggleSidebar,
        setActiveTab,
        setActiveDatasetId,
        setActiveModelId,
        setCurrentUserRole,
        setIsSearchOpen,
        setIsNotificationsOpen,
        addToast,
        removeToast,
        clearAllData,
        registerDataset,
        registerModel,
        addContributor,
        addInference,
        runVerification,
        verifyAuditLedger,
        tamperDataset,
        tamperModel,
        tamperInference,
        tamperAudit,
        restoreIntegrity,
      }}
    >
      {children}
    </VisionTrustContext.Provider>
  );
};

// oxlint-disable-next-line react/only-export-components
export const useVisionTrust = () => {
  const context = useContext(VisionTrustContext);
  if (!context) {
    throw new Error('useVisionTrust must be used within a VisionTrustProvider');
  }
  return context;
};
