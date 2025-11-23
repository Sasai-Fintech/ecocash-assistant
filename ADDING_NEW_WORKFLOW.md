# How to Add a New Workflow (LangGraph Subgraph Approach)

This guide shows you how to add a new guided support workflow using LangGraph subgraphs.

**Note**: This is the updated approach using LangGraph subgraphs. For the older class-based approach, see the git history.

## Step-by-Step Guide

### Step 1: Create Workflow File

Create a new file in `backend/agent/workflows/` with your workflow name, e.g., `insurance.py`:

```python
"""Insurance workflow - handles insurance-related enquiries."""

from typing import List, Dict, Any
from langchain_core.runnables import RunnableConfig
from engine.state import AgentState
from .base import BaseWorkflow


class InsuranceWorkflow(BaseWorkflow):
    """Workflow for insurance enquiries and claims."""
    
    name = "insurance"
    intent_keywords = [
        "insurance", "claim", "coverage", "policy", "premium",
        "insurance claim", "file claim", "insurance enquiry"
    ]
    description = "Handle insurance enquiries and claims"
    
    async def summarize(self, state: AgentState, config: RunnableConfig) -> Dict[str, Any]:
        """Get user's insurance information."""
        # Call your tools here to get insurance data
        return {
            "policies": [...],
            "user_id": state.get("user_id", "demo_user")
        }
    
    def get_summary_message(self, context: Dict[str, Any]) -> str:
        """Generate insurance summary message."""
        policies = context.get("policies", [])
        if policies:
            return f"You have {len(policies)} active insurance policy(ies). How can I help you?"
        return "I can help you with insurance enquiries and claims."
    
    def get_question(self, context: Dict[str, Any]) -> str:
        """Get the question to ask after summary."""
        return "What would you like to know about your insurance?"
    
    def get_suggestions(self, context: Dict[str, Any]) -> List[str]:
        """Get common insurance-related suggestions."""
        return [
            "File a claim",
            "Check policy coverage",
            "Premium payment",
            "Policy renewal",
            "Claim status"
        ]
    
    def get_resolution_guide(self, issue_type: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Get resolution guidance for insurance issues."""
        # Define guides for each issue type
        guides = {
            "file a claim": {
                "message": "I can help you file an insurance claim. Please provide details about the incident.",
                "steps": [
                    "Describe the incident",
                    "Provide date and location",
                    "Submit supporting documents",
                    "Track claim status"
                ],
                "reference": "",
                "can_resolve": False  # Requires claim filing process
            },
            # Add more guides...
        }
        
        # Find matching guide
        issue_lower = issue_type.lower()
        for key, guide in guides.items():
            if key in issue_lower:
                return guide
        
        return {
            "message": "I can help you with insurance. Please provide more details.",
            "steps": ["Describe your enquiry"],
            "reference": "",
            "can_resolve": True
        }
```

### Step 2: Register the Workflow

Add your workflow import to `backend/agent/workflows/__init__.py`:

```python
from .insurance import InsuranceWorkflow

# Add to priority_order in detect_workflow function
priority_order = [
    TransactionHelpWorkflow,
    RefundWorkflow,
    LoanEnquiryWorkflow,
    CardIssueWorkflow,
    InsuranceWorkflow,  # Add here
    GeneralEnquiryWorkflow,
]

# Add to _register_all_workflows function
workflows = [
    TransactionHelpWorkflow,
    RefundWorkflow,
    LoanEnquiryWorkflow,
    CardIssueWorkflow,
    InsuranceWorkflow,  # Add here
    GeneralEnquiryWorkflow,
]
```

### Step 3: Add Tools (if needed)

If your workflow needs new tools, add them to `backend/agent/tools/`:

```python
# backend/agent/tools/insurance.py
from langchain.tools import tool

@tool
def get_insurance_policies(user_id: str) -> List[Dict]:
    """Get user's insurance policies."""
    # Implementation
    pass

@tool
def file_insurance_claim(user_id: str, claim_details: Dict) -> str:
    """File an insurance claim."""
    # Implementation
    pass
```

Then register tools in `backend/agent/tools/__init__.py` and add to graph.

### Step 4: Test Your Workflow

Test by sending messages that match your intent keywords:

```python
# Test messages
"I need help with insurance"
"File an insurance claim"
"Check my insurance coverage"
```

## Workflow Pattern

Every workflow follows this pattern:

1. **IDENTIFY** → `matches_intent()` detects if workflow applies
2. **SUMMARIZE** → `summarize()` gets relevant context
3. **ASK** → `get_question()` asks user what they need
4. **SUGGEST** → `get_suggestions()` offers common options
5. **RESOLVE** → `get_resolution_guide()` provides specific guidance
6. **ESCALATE** → `should_escalate()` determines if ticket needed

## Best Practices

1. **Intent Keywords**: Use specific, unique keywords to avoid conflicts
2. **Empathetic Messages**: Use friendly, helpful tone
3. **Actionable Steps**: Provide clear, numbered steps
4. **Reference Numbers**: Include IDs/refs when available
5. **Self-Service First**: Try to resolve without tickets
6. **Clear Escalation**: Only escalate when truly needed

## Example: Complete Workflow

See `backend/agent/workflows/refund.py` for a complete example of a well-structured workflow.

## Testing Checklist

- [ ] Workflow detects correct intent
- [ ] Summary message is clear and helpful
- [ ] Suggestions are relevant
- [ ] Resolution guides are actionable
- [ ] Escalation logic works correctly
- [ ] Works with existing workflows (no conflicts)

