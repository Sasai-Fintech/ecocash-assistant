from typing import Any, Dict, List, Optional, Union

from pydantic import AnyUrl, BaseModel, Field, conlist, constr
from typing_extensions import Annotated, Literal


class MonetaryValue(BaseModel):
  currency: constr(min_length=3, max_length=3)
  amount: float


class ActionButton(BaseModel):
  id: Optional[str] = None
  label: str
  action: Literal["deeplink", "postback"]
  deeplink: Optional[AnyUrl] = None
  payload: Optional[Dict[str, Any]] = None
  variant: Optional[Literal["primary", "secondary", "danger"]] = None


class BalanceAccount(BaseModel):
  id: str
  label: str
  balance: MonetaryValue
  available: Optional[MonetaryValue] = None
  limit: Optional[MonetaryValue] = None
  deeplink: Optional[AnyUrl] = None


class BalanceCard(BaseModel):
  type: Literal["balance_card"] = "balance_card"
  title: str
  subtitle: Optional[str] = None
  accounts: conlist(BalanceAccount, min_length=1)
  actions: Optional[List[ActionButton]] = None


class FilterChip(BaseModel):
  id: str
  label: str
  selected: bool = False


class TransactionEntry(BaseModel):
  id: str
  postedAt: str
  description: str
  amount: MonetaryValue
  direction: Literal["inflow", "outflow"]
  status: Literal["completed", "pending", "failed"]
  category: Optional[str] = None
  deeplink: Optional[AnyUrl] = None


class TransactionPagination(BaseModel):
  cursor: Optional[str] = None
  hasNextPage: bool


class TransactionTable(BaseModel):
  type: Literal["transaction_table"] = "transaction_table"
  title: str
  filterChips: Optional[List[FilterChip]] = None
  transactions: List[TransactionEntry]
  pagination: Optional[TransactionPagination] = None
  actions: Optional[List[ActionButton]] = None


class TicketSelectField(BaseModel):
  kind: Literal["select"] = "select"
  name: str
  label: str
  options: List[Dict[str, str]]
  required: bool = True


class TicketTextareaField(BaseModel):
  kind: Literal["textarea"] = "textarea"
  name: str
  label: str
  placeholder: Optional[str] = None
  required: bool = True
  maxLength: Optional[int] = None


class TicketAttachmentField(BaseModel):
  kind: Literal["attachment"] = "attachment"
  name: str
  label: str
  maxItems: int = 3


TicketFormField = Union[TicketSelectField, TicketTextareaField, TicketAttachmentField]


class TicketForm(BaseModel):
  type: Literal["ticket_form"] = "ticket_form"
  title: str
  description: Optional[str] = None
  fields: List[TicketFormField]
  submitLabel: str = "Submit"
  cancelLabel: Optional[str] = None
  metadata: Optional[Dict[str, Any]] = None


class ConfirmationDialog(BaseModel):
  type: Literal["confirmation_dialog"] = "confirmation_dialog"
  title: str
  body: str
  severity: Literal["info", "warning", "critical"] = "info"
  confirmLabel: str = "Confirm"
  cancelLabel: str = "Cancel"
  actions: Optional[List[ActionButton]] = None


class TicketStatusItem(BaseModel):
  id: str
  status: Literal["new", "in_progress", "pending_customer", "resolved", "closed"]
  updatedAt: str
  summary: str
  deeplink: Optional[AnyUrl] = None


class TicketStatusBoard(BaseModel):
  type: Literal["ticket_status_board"] = "ticket_status_board"
  title: str
  tickets: List[TicketStatusItem]
  actions: Optional[List[ActionButton]] = None


WidgetPayload = Annotated[
  Union[BalanceCard, TransactionTable, TicketForm, ConfirmationDialog, TicketStatusBoard],
  Field(discriminator="type"),
]

