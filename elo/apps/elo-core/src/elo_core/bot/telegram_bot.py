from __future__ import annotations
import logging
import httpx
from typing import Optional, Dict, Any
from elo_contracts.security import ApprovalRequest, ApprovalDecision
from elo_security.gatekeeper import SecurityGatekeeper

logger = logging.getLogger("elo.bot.telegram")


class TelegramBotNotifier:
    """
    Lightweight Telegram bot integration for alerts, notifications,
    and interactive inline approval buttons for L2/L3 actions.
    """

    def __init__(self, bot_token: Optional[str], admin_chat_id: Optional[str], gatekeeper: SecurityGatekeeper):
        self.bot_token = bot_token
        self.admin_chat_id = admin_chat_id
        self.gatekeeper = gatekeeper
        self.base_url = f"https://api.telegram.org/bot{bot_token}" if bot_token else None

    async def send_message(self, text: str, reply_markup: Optional[Dict[str, Any]] = None) -> bool:
        if not self.base_url or not self.admin_chat_id:
            logger.info(f"[TELEGRAM_MOCK] send_message: {text}")
            return True

        payload: Dict[str, Any] = {
            "chat_id": self.admin_chat_id,
            "text": text,
            "parse_mode": "Markdown",
        }
        if reply_markup:
            payload["reply_markup"] = reply_markup

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(f"{self.base_url}/sendMessage", json=payload)
                return resp.status_code == 200
        except Exception as e:
            logger.error(f"Failed to send Telegram message: {e}")
            return False

    async def notify_approval_required(self, request: ApprovalRequest) -> None:
        """
        Sends an interactive approval prompt to the admin Telegram chat.
        """
        text = (
            f" *[ELO SECURITY GATE: {request.security_level.value}]*\n\n"
            f" *Unealtă solicitată:* `{request.tool_name}`\n"
            f" *Explicație:* {request.explanation}\n"
            f" *Parametri:* `{request.parameters}`\n"
            f" *Expiră în:* 5 minute\n"
            f" *Ticket ID:* `{request.id}`"
        )
        
        reply_markup = {
            "inline_keyboard": [
                [
                    {"text": " Aprobă", "callback_data": f"approve:{request.id}"},
                    {"text": " Respinge", "callback_data": f"deny:{request.id}"},
]
]
        }
        await self.send_message(text, reply_markup=reply_markup)

    async def handle_callback_query(self, callback_data: str, actor: str = "telegram_admin") -> str:
        """
        Processes button clicks from Telegram inline keyboard.
        """
        if not (callback_data.startswith("approve:") or callback_data.startswith("deny:")):
            return "Comandă necunoscută."

        action, req_id = callback_data.split(":", 1)
        is_approved = action == "approve"

        decision = ApprovalDecision(
            request_id=req_id,
            approved=is_approved,
            actor=actor,
        )
        success, token = self.gatekeeper.resolve_request(decision)

        if not success:
            return f" Ticketul `{req_id}` nu a putut fi rezolvat (posibil expirat sau deja procesat)."

        status_str = "APROBAT " if is_approved else "RESPINS "
        return f"Ticket `{req_id}` a fost marcat ca {status_str} de {actor}."
