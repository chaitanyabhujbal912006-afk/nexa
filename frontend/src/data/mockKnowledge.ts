import { CitationItem, KnowledgeDocument, QueryResult, ConflictRecord, TopologyNode, TopologyEdge, AuditLedgerEntry, RagEngineSettings } from '../types';

export const SAMPLE_QUERIES: Record<string, QueryResult> = {
  "What is our current refund policy?": {
    id: "query-refund",
    call_id: "call_9a82b1c4-7832-4df1-8e99-018274619a01",
    query: "What is our current enterprise refund policy?",
    answerText: "For Enterprise clients, the current refund policy states that bulk order returns must be initiated within 15 days of receipt [1]. Additionally, custom integration fees are non-refundable once deployment begins [2].",
    confidence: 97,
    confidence_level: 'HIGH',
    provider: 'gemini',
    latencyMs: 138,
    sourcesVerifiedCount: 3,
    total_chunks_retrieved: 5,
    conflictDetected: true,
    conflictDetails: {
      outdatedSource: "Sales_Terms_2022.pdf",
      outdatedDate: "Nov 12, 2022",
      outdatedClaim: "Bulk order returns accepted up to 30 days without restocking penalties.",
      outdatedConfidence: 54,
      activeSource: "refund_policy_v2.pdf",
      activeDate: "Jan 10, 2024",
      activeClaim: "Bulk order returns must be initiated within 15 days of receipt.",
      activeConfidence: 97,
      verdict: "refund_policy_v2.pdf (Jan 2024, signed off by Legal) supersedes legacy 2022 terms."
    },
    citations: [
      {
        id: 1,
        label: "1",
        sourceDoc: "refund_policy_v2.pdf",
        sourceType: "pdf",
        docDate: "2024-01-10",
        section: "Page 3, Section 2.1",
        excerpt: "Bulk hardware and license returns must be formally initiated within 15 days of verifiable delivery receipt.",
        timestamp: "Jan 10, 2024",
        matchScorePct: 98,
        confidence: 97
      },
      {
        id: 2,
        label: "2",
        sourceDoc: "enterprise_terms.pdf",
        sourceType: "pdf",
        docDate: "2024-02-18",
        section: "Page 8, Clause 4B",
        excerpt: "Professional deployment fees and dedicated architectural setup costs are non-refundable once deployment kickoff commences.",
        timestamp: "Feb 18, 2024",
        matchScorePct: 94,
        confidence: 96
      }
    ]
  },
  "Which warranty terms apply to Enterprise clients?": {
    id: "query-warranty",
    call_id: "call_4c78e901-2189-4ba3-a002-998811223344",
    query: "Which warranty terms apply to Enterprise clients?",
    answerText: "Enterprise tier clients receive 24/7 dedicated hardware replacement within 4 hours [1] and extended SLA coverage guaranteeing 99.99% uptime with financial credits for breaches exceeding 15 minutes [2].",
    confidence: 99,
    confidence_level: 'HIGH',
    provider: 'gemini',
    latencyMs: 112,
    sourcesVerifiedCount: 4,
    total_chunks_retrieved: 4,
    conflictDetected: false,
    citations: [
      {
        id: 1,
        label: "1",
        sourceDoc: "Hardware_SLA_Master.pdf",
        sourceType: "pdf",
        docDate: "2024-02-02",
        section: "Page 12, Sec 5.3",
        excerpt: "On-site critical hardware dispatch within 240 minutes for Tier 1 Enterprise installations.",
        timestamp: "Feb 02, 2024",
        matchScorePct: 99,
        confidence: 99
      },
      {
        id: 2,
        label: "2",
        sourceDoc: "Master_Service_Agreement_2024.docx",
        sourceType: "docx",
        docDate: "2024-01-28",
        section: "Page 4, Art. 9",
        excerpt: "SLA uptime minimum guarantee is benchmarked at 99.99% with 10% monthly rebate penalty for downtime >15 min.",
        timestamp: "Jan 28, 2024",
        matchScorePct: 96,
        confidence: 98
      }
    ]
  },
  "How many days of paid sabbatical are employees entitled to?": {
    id: "query-sabbatical",
    call_id: "call_1b99a721-3321-4f11-9c88-776655443322",
    query: "How many days of paid sabbatical are employees entitled to?",
    answerText: "Under active company policy, employees are entitled to 15 days of paid sabbatical after 5 years of continuous service [1]. An older handbook claiming 45 days was officially deprecated in March 2024 [2].",
    confidence: 98,
    confidence_level: 'HIGH',
    provider: 'groq',
    latencyMs: 94,
    sourcesVerifiedCount: 2,
    total_chunks_retrieved: 3,
    conflictDetected: true,
    conflictDetails: {
      outdatedSource: "HR_Handbook_2021.pdf",
      outdatedDate: "Jan 15, 2021",
      outdatedClaim: "Employees are entitled to 45 days of paid sabbatical after 5 years of continuous service.",
      outdatedConfidence: 42,
      activeSource: "Updated_Benefits_2024.docx",
      activeDate: "Mar 01, 2024",
      activeClaim: "Employees are entitled to 15 days of paid sabbatical after 5 years of continuous service.",
      activeConfidence: 98,
      verdict: "Newer policy (Mar 2024) supersedes older handbook."
    },
    citations: [
      {
        id: 1,
        label: "1",
        sourceDoc: "Updated_Benefits_2024.docx",
        sourceType: "docx",
        docDate: "2024-03-01",
        section: "Section 4.2 - Leave Provisions",
        excerpt: "Full-time team members reaching five consecutive years of employment accrue 15 calendar days of paid sabbatical leave.",
        timestamp: "Mar 01, 2024",
        matchScorePct: 98,
        confidence: 98
      },
      {
        id: 2,
        label: "2",
        sourceDoc: "PeopleOps_Notice_2024_03.eml",
        sourceType: "eml",
        docDate: "2024-03-05",
        section: "Memo Body ¶ 3",
        excerpt: "Legacy 45-day entitlement from 2021 handbook has been retired effective Q1 2024.",
        timestamp: "Mar 05, 2024",
        matchScorePct: 92,
        confidence: 95
      }
    ]
  }
};

export const MOCK_DOCUMENTS: KnowledgeDocument[] = [
  {
    id: "doc-1",
    title: "Policy_2024.pdf",
    type: "pdf",
    date: "2024-03-01",
    status: "active",
    department: "Executive & Governance",
    confidence: 99,
    conflictsCount: 0,
    size: "2.4 MB",
    size_bytes: 2516582,
    vectorCount: 142,
    hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    chunks: [
      { chunkIndex: 1, totalChunks: 4, text: "Section 1.1 Governance Authority: NEXA systems shall enforce cryptographic tenant isolation across all vector indices.", matchScorePct: 99, sha256: "a1b2c3d4e5f6...7890", section: "1.1 Governance" },
      { chunkIndex: 2, totalChunks: 4, text: "Section 1.2 Data Access Control: Access to confidential organizational documents is restricted to verified identity tokens.", matchScorePct: 96, sha256: "b2c3d4e5f6a1...8901", section: "1.2 Access" },
      { chunkIndex: 3, totalChunks: 4, text: "Section 2.1 Audit Retention: Query logs and temporal conflict arbitration records must be immutably sealed for 5 years.", matchScorePct: 95, sha256: "c3d4e5f6a1b2...9012", section: "2.1 Retention" },
      { chunkIndex: 4, totalChunks: 4, text: "Section 3.0 Cryptographic Integrity: All chunk embeddings are validated via SHA-256 integrity trees before ingestion.", matchScorePct: 98, sha256: "d4e5f6a1b2c3...0123", section: "3.0 Integrity" }
    ]
  },
  {
    id: "doc-2",
    title: "Updated_Benefits_2024.docx",
    type: "docx",
    date: "2024-03-01",
    status: "active",
    department: "People Operations",
    confidence: 98,
    conflictsCount: 1,
    size: "1.1 MB",
    size_bytes: 1153433,
    vectorCount: 96,
    hash: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
    chunks: [
      { chunkIndex: 1, totalChunks: 3, text: "Full-time team members reaching five consecutive years of employment accrue 15 calendar days of paid sabbatical leave.", matchScorePct: 98, sha256: "8e234b12...9901", section: "4.2 Sabbatical" },
      { chunkIndex: 2, totalChunks: 3, text: "Parental leave policy provides 16 weeks of fully paid primary caregiver leave after 12 months tenure.", matchScorePct: 94, sha256: "7a123c45...8812", section: "4.3 Parental" },
      { chunkIndex: 3, totalChunks: 3, text: "Healthcare premiums are 100% employer-covered for employees and 80% for verified dependents.", matchScorePct: 92, sha256: "6b998d34...7723", section: "4.4 Health" }
    ]
  },
  {
    id: "doc-3",
    title: "HR_Handbook_2021.pdf",
    type: "pdf",
    date: "2021-01-15",
    status: "outdated",
    department: "People Operations",
    confidence: 42,
    conflictsCount: 1,
    size: "8.6 MB",
    size_bytes: 9017753,
    vectorCount: 310,
    hash: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
    chunks: [
      { chunkIndex: 1, totalChunks: 2, text: "Employees are entitled to 45 days of paid sabbatical after 5 years of continuous service. [DEPRECATED by 2024 Policy]", matchScorePct: 54, sha256: "4d887a23...6611", section: "Legacy Leave § 6" },
      { chunkIndex: 2, totalChunks: 2, text: "Work from home allowance is fixed at $250 annually. [SUPERSEDED]", matchScorePct: 48, sha256: "3c776b12...5500", section: "Legacy Remote § 2" }
    ]
  },
  {
    id: "doc-4",
    title: "refund_policy_v2.pdf",
    type: "pdf",
    date: "2024-01-10",
    status: "active",
    department: "Finance & Legal",
    confidence: 97,
    conflictsCount: 1,
    size: "3.8 MB",
    size_bytes: 3984588,
    vectorCount: 180,
    hash: "6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b",
    chunks: [
      { chunkIndex: 1, totalChunks: 3, text: "Bulk hardware and license returns must be formally initiated within 15 days of verifiable delivery receipt.", matchScorePct: 98, sha256: "1a2b3c4d...4433", section: "2.1 Bulk Returns" },
      { chunkIndex: 2, totalChunks: 3, text: "Deployment engineering fees and dedicated staging environments are non-refundable once kick-off starts.", matchScorePct: 96, sha256: "2b3c4d5e...3322", section: "2.2 Retainers" }
    ]
  },
  {
    id: "doc-5",
    title: "enterprise_terms.pdf",
    type: "pdf",
    date: "2024-02-18",
    status: "active",
    department: "Legal",
    confidence: 96,
    conflictsCount: 0,
    size: "4.2 MB",
    size_bytes: 4404019,
    vectorCount: 220,
    hash: "d4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35",
    chunks: [
      { chunkIndex: 1, totalChunks: 2, text: "Master Service Agreement governing enterprise license grants, confidentiality, and indemnification caps.", matchScorePct: 97, sha256: "9f8e7d6c...2211", section: "Clause 1.0 General" }
    ]
  },
  {
    id: "doc-6",
    title: "CEO_Memo.eml",
    type: "eml",
    date: "2024-02-20",
    status: "active",
    department: "Executive",
    confidence: 95,
    conflictsCount: 0,
    size: "420 KB",
    size_bytes: 430080,
    vectorCount: 24,
    hash: "4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce",
    chunks: [
      { chunkIndex: 1, totalChunks: 1, text: "All teams are mandated to ground customer-facing statements against the NEXA verified knowledge base.", matchScorePct: 95, sha256: "8e7d6c5b...1100", section: "Executive Directive" }
    ]
  },
  {
    id: "doc-7",
    title: "Client_List_2023.xlsx",
    type: "xlsx",
    date: "2023-12-30",
    status: "superseded",
    department: "Sales Ops",
    confidence: 68,
    conflictsCount: 2,
    size: "5.1 MB",
    size_bytes: 5347737,
    vectorCount: 160,
    hash: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
    chunks: [
      { chunkIndex: 1, totalChunks: 1, text: "Historical 2023 account directory. Superseded by live Salesforce CRM synchronization.", matchScorePct: 70, sha256: "7d6c5b4a...0099", section: "Tab 1 - Accounts" }
    ]
  },
  {
    id: "doc-8",
    title: "SOC2_Compliance_2024.pdf",
    type: "pdf",
    date: "2024-02-05",
    status: "active",
    department: "Security & Compliance",
    confidence: 99,
    conflictsCount: 0,
    size: "6.8 MB",
    size_bytes: 7130316,
    vectorCount: 290,
    hash: "ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d",
    chunks: [
      { chunkIndex: 1, totalChunks: 2, text: "SOC 2 Type II audit certification confirms zero-knowledge vector encryption, annual pen-testing, and automated log purging.", matchScorePct: 99, sha256: "6c5b4a39...9988", section: "Security Audit" }
    ]
  }
];

export const CONFLICT_PRESETS = [
  {
    title: "Sabbatical Entitlement (HR)",
    oldDoc: "HR_Handbook_2021.pdf",
    oldDate: "Jan 15, 2021",
    oldClaim: "Employees are entitled to 45 days of paid sabbatical after 5 years of continuous service.",
    oldConf: 42,
    newDoc: "Updated_Benefits_2024.docx",
    newDate: "Mar 01, 2024",
    newClaim: "Employees are entitled to 15 days of paid sabbatical after 5 years of continuous service.",
    newConf: 98,
    issue: "Multiple conflicting sources found regarding sabbatical duration.",
    verdict: "Newer policy (Mar 2024) supersedes older handbook."
  },
  {
    title: "Enterprise Refund Terms (Finance)",
    oldDoc: "Legacy_Sales_Guide_2022.pdf",
    oldDate: "Nov 12, 2022",
    oldClaim: "Full 100% refund available upon written notice within 45 business days of purchase.",
    oldConf: 38,
    newDoc: "refund_policy_v2.pdf",
    newDate: "Jan 10, 2024",
    newClaim: "Bulk order returns must be initiated within 15 days. Deployment fees non-refundable.",
    newConf: 97,
    issue: "Legacy sales documentation conflicts with current audited refund terms.",
    verdict: "Audited financial compliance policy (Jan 2024) takes legal precedence."
  },
  {
    title: "Data Retention & Purging (Security)",
    oldDoc: "Infra_Guidelines_v1.docx",
    oldDate: "Aug 2020",
    oldClaim: "Server audit traces retained indefinitely on cold storage buckets.",
    oldConf: 45,
    newDoc: "SOC2_Compliance_2024.pdf",
    newDate: "Feb 05, 2024",
    newClaim: "Automated cryptographic purge of raw event logs after 90 days of inactivity.",
    newConf: 99,
    issue: "Indefinite retention violates newly certified SOC2 Type II compliance controls.",
    verdict: "SOC2 certified compliance policy (Feb 2024) mandates 90-day auto-purge."
  }
];

export const CONFLICT_RECORDS: ConflictRecord[] = [
  {
    id: "conflict-1",
    topic: "bulk_refund_policy",
    trustedSource: "refund_policy_v2.pdf [Page 3, Section 2.1]",
    trustedDate: "2024-01-10",
    trustedClaim: "Bulk order returns must be formally initiated within 15 calendar days of receipt. Integration retainers non-refundable.",
    outdatedSources: [
      {
        citation: "Sales_Terms_2022.pdf [Section 4.1]",
        date: "2022-11-12",
        claim: "Bulk order returns accepted up to 30 days without restocking penalties."
      },
      {
        citation: "Legacy_Sales_Guide_2020.pdf [Page 9]",
        date: "2020-04-15",
        claim: "Full 100% refund available upon written notice within 45 business days."
      }
    ],
    verdictSummary: "Temporal supersession: Audited Jan 2024 financial policy takes legal precedence over legacy 2020 and 2022 sales guides.",
    ruleApplied: "Rule A (Temporal Supersession)",
    resolved: false
  },
  {
    id: "conflict-2",
    topic: "sabbatical_leave_entitlement",
    trustedSource: "Updated_Benefits_2024.docx [Section 4.2]",
    trustedDate: "2024-03-01",
    trustedClaim: "Full-time team members reaching five consecutive years of employment accrue 15 calendar days of paid sabbatical leave.",
    outdatedSources: [
      {
        citation: "HR_Handbook_2021.pdf [Page 42, § 6]",
        date: "2021-01-15",
        claim: "Employees are entitled to 45 days of paid sabbatical after 5 years of continuous service."
      }
    ],
    verdictSummary: "Temporal supersession: Q1 2024 Board-approved HR benefits revision deprecates legacy 2021 handbook.",
    ruleApplied: "Rule A (Temporal Supersession)",
    resolved: true
  },
  {
    id: "conflict-3",
    topic: "sla_uptime_liability_cap",
    trustedSource: "enterprise_terms.pdf [Clause 8A - MSA Override]",
    trustedDate: "2024-02-18",
    trustedClaim: "Indemnification liability for Tier 1 Enterprise uptime breach is capped strictly at 12 months aggregate software fees.",
    outdatedSources: [
      {
        citation: "General_Customer_Handbook_2023.pdf [Sec 11]",
        date: "2023-09-01",
        claim: "Standard customer liability cap defaults to 3 months of recurring fees."
      }
    ],
    verdictSummary: "Hierarchy of Authority: Master Service Agreement (MSA) terms explicitly override general handbook provisions.",
    ruleApplied: "Rule B (MSA Over Handbook)",
    resolved: false
  }
];

export const MOCK_TOPOLOGY_NODES: TopologyNode[] = [
  { id: "node-1", label: "refund_policy_v2.pdf", type: "pdf", chunk_count: 180, size: "3.8 MB", department: "Finance & Legal", x: 250, y: 180 },
  { id: "node-2", label: "enterprise_terms.pdf", type: "pdf", chunk_count: 220, size: "4.2 MB", department: "Legal", x: 420, y: 140 },
  { id: "node-3", label: "Sales_Terms_2022.pdf", type: "pdf", chunk_count: 95, size: "1.8 MB", department: "Sales Ops", x: 180, y: 320 },
  { id: "node-4", label: "Updated_Benefits_2024.docx", type: "xlsx", chunk_count: 96, size: "1.1 MB", department: "People Ops", x: 580, y: 280 },
  { id: "node-5", label: "HR_Handbook_2021.pdf", type: "pdf", chunk_count: 310, size: "8.6 MB", department: "People Ops", x: 680, y: 380 },
  { id: "node-6", label: "SOC2_Compliance_2024.pdf", type: "pdf", chunk_count: 290, size: "6.8 MB", department: "Security", x: 400, y: 420 },
  { id: "node-7", label: "CEO_Memo.eml", type: "eml", chunk_count: 24, size: "420 KB", department: "Executive", x: 320, y: 280 },
  { id: "node-8", label: "Client_List_2023.xlsx", type: "csv", chunk_count: 160, size: "5.1 MB", department: "Sales Ops", x: 500, y: 200 }
];

export const MOCK_TOPOLOGY_EDGES: TopologyEdge[] = [
  { source: "node-1", target: "node-2", similarity_score: 0.88 },
  { source: "node-1", target: "node-3", similarity_score: 0.94 },
  { source: "node-4", target: "node-5", similarity_score: 0.91 },
  { source: "node-2", target: "node-6", similarity_score: 0.82 },
  { source: "node-7", target: "node-1", similarity_score: 0.76 },
  { source: "node-7", target: "node-4", similarity_score: 0.74 },
  { source: "node-8", target: "node-3", similarity_score: 0.79 },
  { source: "node-6", target: "node-1", similarity_score: 0.85 }
];

export const MOCK_AUDIT_LEDGER: AuditLedgerEntry[] = [
  {
    call_id: "call_9a82b1c4-7832-4df1-8e99-018274619a01",
    timestamp: "2026-08-19T10:42:15Z",
    query: "What is our current enterprise refund policy?",
    answer: "For Enterprise clients, bulk order returns must be initiated within 15 days of receipt via authorized RMA portal [refund_policy_v2.pdf].",
    confidence_level: "HIGH",
    provider: "gemini",
    latency_ms: 138,
    chunks_retrieved_count: 5,
    conflicts_detected_count: 1,
    ipAddress: "192.168.1.42",
    actor: "elena.rostova@starlight.vpc"
  },
  {
    call_id: "call_4c78e901-2189-4ba3-a002-998811223344",
    timestamp: "2026-08-19T10:35:02Z",
    query: "Which warranty terms apply to Enterprise clients?",
    answer: "Enterprise tier clients receive 24/7 dedicated hardware replacement within 4 hours and extended 99.99% SLA uptime.",
    confidence_level: "HIGH",
    provider: "gemini",
    latency_ms: 112,
    chunks_retrieved_count: 4,
    conflicts_detected_count: 0,
    ipAddress: "192.168.1.88",
    actor: "marcus.chen@apex.corp"
  },
  {
    call_id: "call_1b99a721-3321-4f11-9c88-776655443322",
    timestamp: "2026-08-19T09:14:48Z",
    query: "How many days of paid sabbatical are employees entitled to?",
    answer: "Employees accrue 15 calendar days of paid sabbatical after 5 continuous years of tenure [Updated_Benefits_2024.docx].",
    confidence_level: "HIGH",
    provider: "groq",
    latency_ms: 94,
    chunks_retrieved_count: 3,
    conflicts_detected_count: 1,
    ipAddress: "10.0.4.19",
    actor: "elena.rostova@starlight.vpc"
  },
  {
    call_id: "call_7e33a129-9912-4c22-b112-665544332211",
    timestamp: "2026-08-19T08:02:11Z",
    query: "What are the SOC2 log retention guidelines?",
    answer: "Cryptographic event log traces must be automatically purged after 90 days unless subject to active legal hold.",
    confidence_level: "HIGH",
    provider: "gemini",
    latency_ms: 145,
    chunks_retrieved_count: 4,
    conflicts_detected_count: 0,
    ipAddress: "192.168.1.42",
    actor: "david.vance@google-enterprise.com"
  }
];

export const DEFAULT_RAG_SETTINGS: RagEngineSettings = {
  top_k: 5,
  min_similarity: 0.75,
  chunk_overlap_pct: 20,
  context_window_tokens: 32000,
  recency_weight: 0.65,
  authority_weight: 0.35,
  legal_status_bonus: 0.15,
  auto_resolve_threshold: 0.85,
  strictness_mode: "balanced",
  hash_algorithm: "SHA-256",
  audit_ledger_enabled: true
};

