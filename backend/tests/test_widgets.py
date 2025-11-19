from pydantic import TypeAdapter

from agent.widgets import (
  BalanceCard,
  ConfirmationDialog,
  MonetaryValue,
  TransactionEntry,
  TransactionTable,
  WidgetPayload,
)


def test_balance_card_model():
  card = BalanceCard(
    title="Wallet balances",
    accounts=[
      {
        "id": "wallet",
        "label": "EcoCash Wallet",
        "balance": {"currency": "USD", "amount": 10.5},
      }
    ],
  )
  assert card.type == "balance_card"
  assert card.accounts[0].balance.amount == 10.5


def test_transaction_table_adapter():
  entry = TransactionEntry(
    id="txn-1",
    postedAt="2024-01-01T12:00:00Z",
    description="Test",
    amount=MonetaryValue(currency="USD", amount=5),
    direction="outflow",
    status="completed",
  )
  table = TransactionTable(title="Recent", transactions=[entry])
  assert table.type == "transaction_table"


def test_widget_payload_union():
  adapter = TypeAdapter(WidgetPayload)
  payload = {
    "type": "confirmation_dialog",
    "title": "Share statement?",
    "body": "Send the PDF to the user.",
    "severity": "warning",
  }
  widget = adapter.validate_python(payload)
  assert isinstance(widget, ConfirmationDialog)
  assert widget.severity == "warning"

