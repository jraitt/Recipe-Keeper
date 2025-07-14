# Architecture Decision Records (ADR)

This directory contains Architecture Decision Records for the Recipe Keeper project. ADRs document important architectural decisions made during development.

## What are ADRs?

Architecture Decision Records are short text files that capture an important architectural decision made along with its context and consequences. They help teams understand why certain decisions were made and provide historical context for future developers.

## Format

Each ADR follows this structure:

```markdown
# ADR-001: Title of Decision

## Status
Proposed | Accepted | Rejected | Deprecated | Superseded

## Context
What is the issue that we're seeing that is motivating this decision or change?

## Decision
What is the change that we're proposing and/or doing?

## Consequences
What becomes easier or more difficult to do because of this change?
```

## ADR Index

| Number | Title | Status | Date |
|--------|-------|--------|------|
| [001](./001-technology-stack.md) | Technology Stack Selection | Accepted | 2024-01-14 |
| [002](./002-database-schema.md) | Database Schema Design | Accepted | 2024-01-14 |
| [003](./003-ai-integration.md) | AI Service Integration | Accepted | 2024-01-14 |

## Creating New ADRs

1. **Number**: Use the next sequential number (e.g., ADR-004)
2. **Title**: Short, descriptive title
3. **File Name**: `{number}-{title-kebab-case}.md`
4. **Status**: Start with "Proposed"
5. **Content**: Follow the template above

## Guidelines

- **One decision per ADR**: Keep each ADR focused on a single architectural decision
- **Immutable**: Once accepted, ADRs should not be modified except to mark them as superseded
- **Context matters**: Provide enough background for future developers to understand the decision
- **Consequences**: Be honest about both positive and negative consequences
- **Linkage**: Reference other ADRs when relevant

## Templates

### Basic Template
```markdown
# ADR-XXX: [Title]

## Status
Proposed

## Context
[Describe the context and problem statement]

## Decision
[Describe the decision and rationale]

## Consequences
[Describe the consequences of the decision]
```

### Extended Template
```markdown
# ADR-XXX: [Title]

## Status
Proposed

## Context
[Describe the context and problem statement]

## Considered Options
- Option 1: [Brief description]
- Option 2: [Brief description]
- Option 3: [Brief description]

## Decision
[Describe the chosen option and rationale]

## Consequences

### Positive
- [Positive consequence 1]
- [Positive consequence 2]

### Negative
- [Negative consequence 1]
- [Negative consequence 2]

### Neutral
- [Neutral consequence 1]

## Related ADRs
- [ADR-XXX: Related Decision]
```

## Review Process

1. **Propose**: Create ADR with "Proposed" status
2. **Discuss**: Review with team/stakeholders
3. **Decide**: Update status to "Accepted" or "Rejected"
4. **Document**: Ensure consequences are well documented
5. **Implement**: Proceed with implementation

## Maintenance

ADRs should be:
- Reviewed during architecture reviews
- Updated when superseded by new decisions
- Referenced in code and documentation
- Considered when making related decisions

---

For more information about ADRs, see:
- [ADR Tools](https://github.com/npryce/adr-tools)
- [Architecture Decision Records](https://adr.github.io/)
- [Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)