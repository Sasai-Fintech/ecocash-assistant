# Generative UI Widgets with Human-in-the-Loop Ticket Confirmation

## Summary
This PR implements generative UI widgets that render inline in chat messages and adds a human-in-the-loop confirmation flow for ticket creation.

## Key Changes

### Frontend
- **Generative UI Widgets**: Implemented `useCopilotAction` with `render` for balance and transaction widgets
  - Widgets automatically render inline when tools are called
  - Follows [CopilotKit backend tools pattern](https://docs.copilotkit.ai/langgraph/generative-ui/backend-tools)
  - Added loading states during tool execution

- **Human-in-the-Loop Ticket Confirmation**
  - Updated `TicketConfirmation` component to use `handler` from `renderAndWait`
  - Requires explicit user confirmation before creating tickets
  - Issue and description auto-populated from user query

- **Widget Components**
  - `BalanceCard` and `TransactionTable` now accept props directly (pure components)
  - Removed external balance card from header
  - Created `EcocashWidgets` component to centralize widget registration

### Backend
- **Simplified Graph Structure**
  - Use standard `ToolNode` for tool execution
  - Removed custom state management for widgets
  - Tools return values directly (no state extraction needed)

- **Human-in-the-Loop Flow**
  - Added `ticket_confirmation_node` for showing confirmation dialog
  - Added `perform_ticket_node` for executing ticket creation after confirmation
  - Added `interrupt_after=["ticket_confirmation"]` to pause execution
  - Routing logic separates confirmation and execution

- **LLM Instructions**
  - Updated system message to guide LLM to extract issue and description from user queries
  - Improved tool calling guidance

## Technical Details

### Widget Rendering Pattern
```typescript
useCopilotAction({
  name: "get_balance", // Must match tool name
  render: ({ args, result, status }) => {
    if (status !== "complete") {
      return <LoadingState />;
    }
    return <BalanceCard accounts={...} />;
  },
});
```

### Human-in-the-Loop Pattern
```typescript
useCopilotAction({
  name: "create_ticket",
  renderAndWait: ({ subject, body, status, handler }) => {
    return (
      <TicketConfirmation 
        issue={subject}
        description={body}
        status={status}
        handler={handler} // Sends "CONFIRM" or "CANCEL"
      />
    );
  },
});
```

### Backend Flow
1. User reports issue → LLM calls `create_ticket` with extracted subject/body
2. Graph routes to `ticket_confirmation_node` → Shows confirmation dialog
3. Graph interrupts and waits for user response
4. User clicks Confirm/Cancel → Handler sends response
5. Graph routes to `perform_ticket_node` → Creates ticket or cancels

## Testing Checklist
- [x] Balance widget renders inline when asking "What's my balance?"
- [x] Transaction table renders inline when asking "Show me transactions"
- [x] Ticket confirmation dialog appears with issue and description populated
- [x] Ticket is only created after clicking "Confirm"
- [x] Cancelling ticket creation shows friendly message
- [x] Issue and description extracted from user query automatically
- [x] Footer displays "Powered By Sasai" instead of "Powered by CopilotKit"
- [x] Chat input box remains functional after footer customization

## Files Changed
- `backend/agent/graph.py` - Added human-in-the-loop nodes and routing
- `backend/engine/chat.py` - Updated LLM instructions, lazy LLM initialization
- `backend/engine/state.py` - Simplified state (removed widget data fields)
- `backend/agent/tools.py` - Tools return values directly
- `frontend/components/EcocashWidgets.tsx` - New component for widget registration
- `frontend/components/widgets/*.tsx` - Updated to accept props directly
- `frontend/app/page.tsx` - Removed external balance card
- `frontend/app/globals.css` - Added CSS to replace footer branding
- `frontend/lib/types.ts` - Simplified types

## References
- [CopilotKit Backend Tools Documentation](https://docs.copilotkit.ai/langgraph/generative-ui/backend-tools)
- [LangGraph Human-in-the-Loop](https://langchain-ai.github.io/langgraph/concepts/human_in_the_loop/)

