# Reverse Engineering Plan: Travel Example → Ecocash Assistant

## Strategy
Instead of debugging our implementation, we'll:
1. Run the official CopilotKit travel example
2. Verify it works end-to-end
3. Understand exactly how it works
4. Modify it step-by-step to become our Ecocash Assistant

## Phase 1: Run Travel Example ✅ IN PROGRESS
- [x] Clone travel example to `/tmp/copilotkit-reference`
- [x] Add `.env` files with OPENAI_API_KEY
- [ ] Install backend dependencies (`poetry install`)
- [ ] Start backend (`poetry run demo`)
- [ ] Install frontend dependencies (`npm install`)
- [ ] Start frontend (`npm run dev`)
- [ ] Test in browser - verify it works!

## Phase 2: Understand Travel Example
- [ ] Document the agent structure (nodes, edges, state)
- [ ] Document the tools (add_trips, search_for_places, etc.)
- [ ] Document the frontend (widgets, actions)
- [ ] Document the API route setup
- [ ] Identify key differences from our implementation

## Phase 3: Transform to Ecocash (Step-by-Step)
### Backend Transformation:
- [ ] Keep: FastAPI structure, CopilotKitRemoteEndpoint, LangGraphAgent
- [ ] Replace: Agent name (`travel` → `ecocash_agent`)
- [ ] Replace: State structure (trips → wallet/transactions)
- [ ] Replace: Nodes (trips_node → balance_node, transactions_node, ticket_node)
- [ ] Replace: Tools (add_trips → get_balance, list_transactions, create_ticket)
- [ ] Keep: MemorySaver, interrupt points pattern

### Frontend Transformation:
- [ ] Keep: API route structure (exact copy)
- [ ] Keep: CopilotKit setup in page.tsx
- [ ] Replace: Agent name in CopilotKit prop
- [ ] Replace: Widgets (map → balance card, transactions table)
- [ ] Replace: Actions (trip actions → wallet actions)
- [ ] Keep: .env.local with OPENAI_API_KEY

## Phase 4: Test & Verify
- [ ] Test balance widget
- [ ] Test transactions widget
- [ ] Test ticket creation with HITL
- [ ] Verify conversation memory works
- [ ] Document final working setup

## Expected Outcome
A working Ecocash Assistant that:
- ✅ Follows exact CopilotKit patterns (proven to work)
- ✅ Has our custom features (balance, transactions, tickets)
- ✅ Works reliably (no more connection errors)
- ✅ Is maintainable (matches official examples)

## Current Status
🔄 Installing travel example backend dependencies...
