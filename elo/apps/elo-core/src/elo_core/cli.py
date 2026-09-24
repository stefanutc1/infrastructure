#!/usr/bin/env python3
"""
Interactive CLI testing interface for ELO.
Allows testing commands, observing LLM reasoning, security gates, and audit trails directly.
"""
import sys
import asyncio
from elo_core.main import engine, gatekeeper, audit_logger
from elo_contracts.security import ApprovalDecision


async def run_cli():
    print("=" * 60)
    print(" ELO — Personal AI Operating Layer (Interactive CLI)")
    print("Type your message or 'exit' to quit.")
    print("=" * 60)

    while True:
        try:
            user_input = input("\n YOU > ").strip()
            if not user_input:
                continue
            if user_input.lower() in ("exit", "quit"):
                print(" Shutting down ELO CLI.")
                break

            print("\n  ELO is thinking and evaluating tools...")
            result = await engine.process_user_message(user_input, actor="cli_admin")

            if result["status"] == "COMPLETED":
                print(f"\n ELO > {result['response']}")
                if result.get("tools_executed"):
                    print("\n[Tools Executed]:")
                    for t in result["tools_executed"]:
                        print(f"  • {t['tool']} (success={t['success']})")
            
            elif result["status"] == "AWAITING_APPROVAL":
                req = result["approval_request"]
                print(f"\n  [SECURITY GATE TRIGGERED: {req['security_level']}]")
                print(f"Unealtă solicitată: {req['tool_name']}")
                print(f"Parametri: {req['parameters']}")
                print(f"Explicație: {req['explanation']}")
                
                choice = input("\n Doriți să aprobați acțiunea? [y/n]: ").strip().lower()
                is_approved = choice in ("y", "yes", "da")
                
                decision = ApprovalDecision(
                    request_id=req["id"],
                    approved=is_approved,
                    actor="cli_admin",
                )
                success, cap_token = gatekeeper.resolve_request(decision)
                
                if success and is_approved:
                    print(f" Acțiune aprobată! Token de capabilitate emis.")
                else:
                    print(f" Acțiune respinsă.")

        except (KeyboardInterrupt, EOFError):
            print("\n Exiting.")
            break


def main():
    asyncio.run(run_cli())


if __name__ == "__main__":
    main()
