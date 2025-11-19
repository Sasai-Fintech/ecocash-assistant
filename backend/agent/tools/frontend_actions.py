from agno.tools import tool

from agent.widgets import ConfirmationDialog, WidgetPayload


@tool(external_execution=True)
def render_widget(widget: WidgetPayload) -> str:
  """
  Request the frontend to render an AG-UI widget. Provide the full widget payload
  using the validated WidgetPayload schema so the UI can safely render cards, tables, or boards.
  """


@tool(external_execution=True)
def request_confirmation(dialog: ConfirmationDialog) -> str:
  """
  Ask the frontend to show a confirmation dialog before performing a sensitive action.
  Pass a ConfirmationDialog payload describing the summary and labels.
  """

