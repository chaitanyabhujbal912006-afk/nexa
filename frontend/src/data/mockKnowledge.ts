import { QueryScenario, ConflictRecord } from '../types';

export const SCENARIOS: Record<string, QueryScenario> = {
  refund: {
    id: 'refund',
    shortQuery: 'What is our current refund policy?',
    question: 'What is our current enterprise refund policy?',
    confidence: 97,
    verifiedAnswer:
      'For Enterprise clients, the current refund policy states that bulk order returns must be initiated within 15 days of receipt [1]. Additionally, custom integration fees are non-refundable once deployment begins [2].',
    highlightWords: [
      { text: '15 days of receipt [1]', citationId: 1 },
      { text: 'non-refundable once deployment begins [2]', citationId: 2 },
    ],
    sourcesVerifiedCount: 3,
    conflictDetected: true,
    conflictDetails: {
      summary: 'Superseded 2021 sales guidelines had allowed 30-day returns on bulk units.',
      resolution: 'Enforcing Active 2024 Master Service Agreement terms (Clause 4B).',
    },
    citations: [
      {
        id: 1,
        docName: 'refund_policy_v2.pdf',
        docType: 'pdf',
        pageOrSection: 'Page 3, Section 2.1',
        excerpt:
          'Clause 2.1 Bulk Orders: Enterprise bulk physical & virtual unit purchases must submit notice of refund or return within 15 calendar days from timestamped receipt.',
        relevanceScore: 98,
        highlightText: 'must be initiated within 15 days of receipt',
      },
      {
        id: 2,
        docName: 'enterprise_terms.pdf',
        docType: 'pdf',
        pageOrSection: 'Page 8, Clause 4B',
        excerpt:
          'Clause 4B Professional Services: Engineering hours and custom platform integration setup fees are non-refundable once sandbox deployment begins.',
        relevanceScore: 95,
        highlightText: 'non-refundable once deployment begins',
      },
    ],
  },
  warranty: {
    id: 'warranty',
    shortQuery: 'Which warranty terms apply to Enterprise clients?',
    question: 'Which warranty terms apply to Enterprise clients with dedicated nodes?',
    confidence: 99,
    verifiedAnswer:
      'Enterprise dedicated instances receive 99.99% uptime SLA guarantee backed by 4-hour hardware replacement [1] and priority 1 disaster failover within 90 seconds [2]. Standard 1-year parts coverage applies to on-prem edge appliances.',
    highlightWords: [
      { text: '4-hour hardware replacement [1]', citationId: 1 },
      { text: 'disaster failover within 90 seconds [2]', citationId: 2 },
    ],
    sourcesVerifiedCount: 4,
    conflictDetected: false,
    citations: [
      {
        id: 1,
        docName: 'enterprise_sla_matrix_2024.pdf',
        docType: 'pdf',
        pageOrSection: 'Page 12, Appendix B',
        excerpt:
          'Dedicated Hardware Tier: Guaranteed 4-hour MTTR hardware component swap with on-site technician dispatch in Tier 1 metropolitan zones.',
        relevanceScore: 99,
        highlightText: '4-hour hardware replacement',
      },
      {
        id: 2,
        docName: 'infrastructure_architecture_v4.docx',
        docType: 'docx',
        pageOrSection: 'Section 6.3 Failover Protocol',
        excerpt:
          'Geo-redundant cross-region clusters automate failover traffic routing with a verified 90-second convergence window.',
        relevanceScore: 97,
        highlightText: 'priority 1 disaster failover within 90 seconds',
      },
    ],
  },
  sabbatical: {
    id: 'sabbatical',
    shortQuery: 'What is our sabbatical leave policy?',
    question: 'What is our company policy on paid sabbatical leave duration for tenured employees?',
    confidence: 98,
    verifiedAnswer:
      'Employees are entitled to 15 days of paid sabbatical after 5 years of continuous service [1]. Any unused sabbatical days do not roll over past the 12-month anniversary window [2].',
    highlightWords: [
      { text: '15 days of paid sabbatical after 5 years [1]', citationId: 1 },
      { text: 'do not roll over past the 12-month anniversary [2]', citationId: 2 },
    ],
    sourcesVerifiedCount: 2,
    conflictDetected: true,
    conflictDetails: {
      summary: 'Legacy HR Handbook 2021 stated 45 days. Updated Benefits 2024 revised it to 15 days.',
      resolution: 'Newer policy (Mar 2024) supersedes older 2021 handbook.',
    },
    citations: [
      {
        id: 1,
        docName: 'Updated_Benefits_2024.docx',
        docType: 'docx',
        pageOrSection: 'Section 4, Page 11',
        excerpt:
          'Tenure Benefits: Effective Q1 2024, full-time employees reaching 5 continuous years receive 15 working days of fully paid sabbatical leave.',
        relevanceScore: 98,
        highlightText: '15 days of paid sabbatical after 5 years of continuous service',
      },
      {
        id: 2,
        docName: 'Global_People_Operations_Guide.pdf',
        docType: 'pdf',
        pageOrSection: 'Page 22, Subsection 3.2',
        excerpt:
          'Sabbaticals must be scheduled and taken within 12 months of qualifying date; unused credits are forfeited without cash redemption.',
        relevanceScore: 94,
        highlightText: 'do not roll over past 12 months',
      },
    ],
  },
};

export const CONFLICT_RECORDS: ConflictRecord[] = [
  {
    id: 'sabbatical-conflict',
    topic: 'Sabbatical Duration Policy',
    outdatedSource: {
      docName: 'HR_Handbook_2021.pdf',
      snippet: '"Employees are entitled to 45 days of paid sabbatical after 5 years of continuous service."',
      date: 'Jan 15, 2021',
      confidence: 42,
    },
    activeSource: {
      docName: 'Updated_Benefits_2024.docx',
      snippet: '"Employees are entitled to 15 days of paid sabbatical after 5 years of continuous service."',
      date: 'Mar 01, 2024',
      confidence: 98,
    },
    conflictDescription: 'Multiple conflicting sources found regarding sabbatical duration.',
    verdict: 'Nexa Verdict',
    verdictReason: 'Newer policy (Mar 2024) supersedes older handbook.',
  },
  {
    id: 'refund-window-conflict',
    topic: 'Enterprise Return Window',
    outdatedSource: {
      docName: 'Sales_Playbook_2020.pdf',
      snippet: '"Standard bulk licenses qualify for 30-day grace period refund upon onboarding."',
      date: 'Aug 10, 2020',
      confidence: 38,
    },
    activeSource: {
      docName: 'refund_policy_v2.pdf',
      snippet: '"Bulk order returns must be initiated within 15 days of receipt."',
      date: 'Jan 18, 2024',
      confidence: 97,
    },
    conflictDescription: 'Discrepancy in permitted return initiation timeframe.',
    verdict: 'Nexa Verdict',
    verdictReason: 'Master Terms v2 (2024) legally overrides internal sales playbook.',
  },
];
