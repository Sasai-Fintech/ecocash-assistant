# Scaling Architecture for Multiple Workflows

## Overview

This document outlines a scalable architecture to handle multiple guided support workflows (refunds, loans, cards, general enquiries, etc.) using **LangGraph subgraphs** for native state management and better scalability.

## Architecture Principles

1. **LangGraph Subgraphs**: Each workflow is a compiled LangGraph subgraph
2. **Native State Management**: State persists across workflow steps with checkpointing
3. **Visual Debugging**: View workflow execution in LangGraph Studio
4. **Modular Design**: Each workflow is self-contained in its own subgraph
5. **Tool Integration**: Tools accessible from any subgraph node
6. **Conditional Routing**: Main graph routes to appropriate subgraph based on intent

## Directory Structure

```
backend/
├── agent/
│   ├── tools/
│   │   ├── __init__.py          # Tool registry
│   │   ├── transactions.py      # Transaction-related tools
│   │   ├── refunds.py           # Refund-related tools
│   │   ├── loans.py              # Loan-related tools
│   │   ├── cards.py              # Card-related tools
│   │   └── general.py            # General enquiry tools
│   ├── workflows/
│   │   ├── __init__.py           # Workflow registry
│   │   ├── base.py               # Base workflow class
│   │   ├── transaction_help.py  # Transaction help workflow
│   │   ├── refund.py             # Refund workflow
│   │   ├── loan_enquiry.py      # Loan enquiry workflow
│   │   ├── card_issue.py         # Card issue workflow
│   │   └── general_enquiry.py   # General enquiry workflow
│   ├── graph.py                  # Main graph (uses workflow registry)
│   └── state.py                  # State definitions
├── engine/
│   ├── chat.py                   # Chat node (uses workflow router)
│   └── workflow_router.py        # Routes to appropriate workflow
```

## Workflow Pattern

Every workflow follows this pattern:

```
1. IDENTIFY → Detect intent (transaction help, refund, loan, etc.)
2. SUMMARIZE → Get relevant context (transaction details, loan status, etc.)
3. ASK → "Tell us what's wrong" or specific question
4. SUGGEST → Offer common issues/options
5. RESOLVE → Provide guidance with actionable steps
6. ESCALATE → Create ticket only if needed
```

## Implementation Plan

### Phase 1: Base Infrastructure
- Create base workflow class
- Create workflow registry
- Refactor existing transaction workflow to use base class

### Phase 2: Add New Workflows
- Refund workflow
- Loan enquiry workflow
- Card issue workflow
- General enquiry workflow

### Phase 3: Advanced Features
- Workflow state persistence
- Workflow analytics
- A/B testing different workflows
- Multi-step workflows with branching

## Example: Adding a New Workflow

```python
# backend/agent/workflows/refund.py
from .base import BaseWorkflow

class RefundWorkflow(BaseWorkflow):
    name = "refund"
    intent_keywords = ["refund", "money back", "return payment"]
    
    async def summarize(self, state, config):
        # Get refund-eligible transactions
        return await get_refund_eligible_transactions(...)
    
    def get_suggestions(self):
        return [
            "Transaction not received",
            "Wrong amount charged",
            "Service not provided",
            "Cancelled order"
        ]
    
    def get_resolution_guide(self, issue_type):
        # Return specific guidance based on issue
        return {...}
```

## Benefits

1. **Scalability**: Easy to add new workflows without touching existing code
2. **Maintainability**: Each workflow is isolated and testable
3. **Consistency**: All workflows follow the same pattern
4. **Reusability**: Common logic in base class
5. **Flexibility**: Each workflow can customize steps as needed

