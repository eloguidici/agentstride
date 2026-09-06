# Initial use cases

These are the cases we are using to decide what belongs in the runtime.

They are not marketing examples yet. They are design tests.

## 1. Internal support agent

An agent receives a technical question, searches internal documentation and can call operational tools such as looking up a customer or creating a ticket.

This tests:

- tools;
- RAG;
- structured output;
- context;
- tracing;
- approvals.

## 2. Document analysis

An agent reads a document and returns structured information such as risks, dates, obligations or classifications.

This tests:

- file / retrieval integrations;
- structured output;
- validation;
- traceability.

## 3. Operational backend agent

An agent lives inside an existing backend and calls company APIs.

For example:

- retrieve a customer;
- inspect recent activity;
- create or update a case;
- require approval before a sensitive action.

This is important because AgentStride is meant to be embeddable. It is not primarily a chatbot product.

## 4. Coordinator with specialized agents

A coordinator can delegate work to specialized agents such as compliance, security or support.

The first version should prefer a simple agents-as-capabilities model instead of introducing a graph or event bus too early.

## 5. A project that grows

A team starts with a small agent and later needs more complex orchestration.

The useful test here is whether tools, schemas, prompts and domain services can move to another framework without being rewritten.

This is a core design constraint, not just a migration feature.
