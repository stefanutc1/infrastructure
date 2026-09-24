from __future__ import annotations
import logging
import httpx
from typing import Optional, Dict, Any

logger = logging.getLogger("elo.core.notifier")


class AlertDispatcher:
    """
    Multi-Channel Phone & Incident Alert Dispatcher for ELO.
    
    Supported Channels:
    1. SMS Gateway (Twilio, Vonage, Generic HTTP SMS Gateway / Android SMS Server)
    2. Telegram Bot (Instant Interactive Alerts with Approval Buttons)
    3. NTFY.sh / Pushover Mobile Push (Free, zero-config high-priority mobile alarms)
    """

    def __init__(
        self,
        phone_number: Optional[str] = None,
        twilio_account_sid: Optional[str] = None,
        twilio_auth_token: Optional[str] = None,
        twilio_from_number: Optional[str] = None,
        sms_webhook_url: Optional[str] = None,
        telegram_bot_token: Optional[str] = None,
        telegram_chat_id: Optional[str] = None,
        ntfy_topic: Optional[str] = "elo-homelab-alerts",
    ):
        self.phone_number = phone_number
        self.twilio_account_sid = twilio_account_sid
        self.twilio_auth_token = twilio_auth_token
        self.twilio_from_number = twilio_from_number
        self.sms_webhook_url = sms_webhook_url
        self.telegram_bot_token = telegram_bot_token
        self.telegram_chat_id = telegram_chat_id
        self.ntfy_topic = ntfy_topic

    async def send_sms_alert(self, message: str, to_number: Optional[str] = None) -> Dict[str, Any]:
        """
        Sends an SMS alert to the specified phone number via Twilio or custom SMS Gateway.
        """
        target = to_number or self.phone_number
        if not target:
            logger.warning("[NOTIFIER] No phone number specified for SMS alert.")
            return {"status": "SKIPPED", "reason": "No phone number provided."}

        # 1. Twilio SMS
        if self.twilio_account_sid and self.twilio_auth_token and self.twilio_from_number:
            url = f"https://api.twilio.com/2010-04-01/Accounts/{self.twilio_account_sid}/Messages.json"
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(
                    url,
                    auth=(self.twilio_account_sid, self.twilio_auth_token),
                    data={
                        "From": self.twilio_from_number,
                        "To": target,
                        "Body": f" [ELO ALERT]: {message}",
                    },
                )
                if resp.status_code in [200, 201]:
                    logger.info(f"[SMS SENT] Alert successfully sent to {target} via Twilio.")
                    return {"status": "SUCCESS", "channel": "twilio_sms", "target": target}
                else:
                    logger.error(f"[SMS ERROR] Twilio returned {resp.status_code}: {resp.text}")
                    return {"status": "FAILED", "channel": "twilio_sms", "error": resp.text}

        # 2. Custom SMS Webhook Gateway (e.g. Local GSM modem or Android SMS gateway app)
        if self.sms_webhook_url:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(
                    self.sms_webhook_url,
                    json={"to": target, "message": f" [ELO ALERT]: {message}"},
                )
                if resp.status_code in [200, 201, 204]:
                    logger.info(f"[SMS SENT] Alert sent to {target} via SMS Webhook Gateway.")
                    return {"status": "SUCCESS", "channel": "sms_webhook", "target": target}

        # 3. Fallback: Log SMS simulation if not configured
        logger.info(f"[SMS SIMULATION] To: {target} | Message: {message}")
        return {
            "status": "SIMULATED",
            "channel": "sms_simulation",
            "target": target,
            "message": message,
            "note": "Configure TWILIO or SMS_WEBHOOK_URL in settings/.env for live GSM carrier dispatch.",
        }

    async def send_ntfy_push(self, title: str, message: str, priority: str = "high") -> Dict[str, Any]:
        """
        Sends an instant high-priority mobile push notification via NTFY (works on iOS & Android without API keys).
        """
        if not self.ntfy_topic:
            return {"status": "SKIPPED"}

        url = f"https://ntfy.sh/{self.ntfy_topic}"
        headers = {
            "Title": title,
            "Priority": "urgent" if priority == "critical" else "high",
            "Tags": "warning,shield,bell",
        }
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                resp = await client.post(url, content=message.encode("utf-8"), headers=headers)
                if resp.status_code in [200, 201]:
                    logger.info(f"[NTFY PUSH] Notification sent to topic '{self.ntfy_topic}'.")
                    return {"status": "SUCCESS", "channel": "ntfy_push"}
        except Exception as e:
            logger.warning(f"[NTFY ERROR] Failed to send push: {e}")
            return {"status": "FAILED", "error": str(e)}

    async def send_telegram_alert(self, message: str) -> Dict[str, Any]:
        """
        Sends an alert message to Telegram chat.
        """
        if not self.telegram_bot_token or not self.telegram_chat_id:
            return {"status": "SKIPPED", "reason": "Telegram credentials not configured."}

        url = f"https://api.telegram.org/bot{self.telegram_bot_token}/sendMessage"
        payload = {
            "chat_id": self.telegram_chat_id,
            "text": f" *[ELO INCIDENT ALERT]*\n\n{message}",
            "parse_mode": "Markdown",
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    return {"status": "SUCCESS", "channel": "telegram"}
        except Exception as e:
            logger.error(f"[TELEGRAM ERROR] Failed to send alert: {e}")
            return {"status": "FAILED", "error": str(e)}

    async def broadcast_incident(
        self,
        title: str,
        message: str,
        severity: str = "high",
        phone_number: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Broadcasts an incident alert across all configured phone/mobile channels simultaneously.
        """
        results = {}
        # 1. SMS Alert
        results["sms"] = await self.send_sms_alert(f"{title}: {message}", to_number=phone_number)
        
        # 2. Mobile Push (NTFY)
        results["push"] = await self.send_ntfy_push(title=title, message=message, priority=severity)
        
        # 3. Telegram
        results["telegram"] = await self.send_telegram_alert(f"*{title}*\n{message}\n_Severitate: {severity.upper()}_")
        
        return {
            "incident_title": title,
            "severity": severity,
            "dispatched_channels": results,
        }
