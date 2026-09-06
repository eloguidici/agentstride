/**
 * Pure domain knowledge corpus + thin RAG wiring helper.
 * Retriever factory is injected from the app so this file stays free of AgentStride imports.
 */

export const KNOWLEDGE_DOCUMENTS = [
  {
    id: "policy-prod-access",
    text: "Production access policy: automatic grants are forbidden. Security review and human approval are required before enabling production credentials. Support may open a ticket and document risk.",
  },
  {
    id: "troubleshoot-access",
    text: "Troubleshooting cannot access production: verify customer status, confirm MFA enrollment, check IP allowlists, and escalate to security if access remains blocked after account validation.",
  },
  {
    id: "security-requirements",
    text: "Security requirements: never expose production secrets in chat. Prefer ticket creation with requiresHumanApproval=true for elevated access.",
  },
];

export function searchKnowledgeWithRetriever(retriever, query, options) {
  return retriever.retrieve(query, options);
}
