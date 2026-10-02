export interface CertificateData {
  id: string;
  learnerName: string;
  issueDate: string;
  skills: string[];
  courseTitle: string;
  totalModules: number;
  totalLessons: number;
}

export const VERIFIED_SKILLS = [
  'Multi-Table JOINs & Complex Queries',
  'Grouping, Aggregations & HAVING Clauses',
  'Subqueries & Common Table Expressions (CTEs)',
  'Window Functions (ROW_NUMBER, RANK, LAG/LEAD)',
  'Database Indexing & Query Execution Optimization',
  'Temporal Tables & Time-Series Analytics',
  'Stored Procedures, Triggers & User-Defined Functions (UDFs)',
  'JSON & XML Data Manipulation',
];

/**
 * Generates a 6-character random uppercase unguessable Certificate ID.
 * Format: SQL-2026-XXXXXX
 */
export function generateRandomCertificateId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomCode = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    randomCode += chars[randomIndex];
  }
  const year = new Date().getFullYear();
  return `SQL-${year}-${randomCode}`;
}

/**
 * Generates a clean Credential ID (fallback / deterministic).
 * Format: SQL-2026-XXXXXX
 */
export function generateCredentialId(name: string, seed: string = 'SQL-MASTERY'): string {
  const cleanName = (name || 'LEARNER').trim().toUpperCase();
  let hash = 0;
  const combined = `${cleanName}-${seed}`;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash << 5) - hash + combined.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(6, 'X').slice(0, 6);
  const year = new Date().getFullYear();
  return `SQL-${year}-${hex}`;
}

/**
 * Generates the official LinkedIn "Add Certification to Profile" link.
 */
export function buildLinkedInCertUrl(options: {
  learnerName: string;
  credentialId: string;
  verificationUrl: string;
}): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const params = new URLSearchParams({
    startTask: 'CERTIFICATION_NAME',
    name: 'Advanced SQL Mastery Certification',
    organizationName: 'SQL Mastery',
    issueYear: year.toString(),
    issueMonth: month.toString(),
    certUrl: options.verificationUrl,
    certId: options.credentialId,
  });

  return `https://www.linkedin.com/profile/add?${params.toString()}`;
}
