from __future__ import annotations

from statistics import mean
from typing import Any, Dict, List

from prisma import Prisma


async def build_social_impact(db: Prisma) -> Dict[str, Any]:
    usuarios = await db.usuario.find_many(include={"matriculas": {"include": {"curso": True}}})
    cursos = await db.materialfonte.find_many()
    checkins = await db.checkinbio.find_many()
    sessoes = await db.sessaoaprendizado.find_many()

    total_users = len(usuarios) or 1
    sustainable_pace = 0
    if checkins:
        focus_avg = mean(c.nivelFoco or 0 for c in checkins)
        stress_avg = mean(c.nivelEstresse or 0 for c in checkins)
        sustainable_pace = int(0.6 * focus_avg + 0.4 * (100 - stress_avg))

    green_courses = [
        c for c in cursos if "sust" in (c.categoria or "").lower() or "sust" in (c.descricao or "").lower()
    ]
    carbon_alerts = max(0, len(checkins) - len(green_courses) * 4)
    missions_completed = sum(
        1
        for u in usuarios
        for m in (u.matriculas or [])
        if m.ehObrigatorio and m.status == "CONCLUIDO"
    )
    belonging_index = 0
    streaks = [u.diasSequencia or 0 for u in usuarios]
    if streaks:
        belonging_index = int(min(1.0, mean(streaks) / 30) * 100)
    roles = [u.cargo or "Colaborador" for u in usuarios]
    diversity_index = int(len(set(roles)) / total_users * 100)

    optional_paths = [
        m
        for u in usuarios
        for m in (u.matriculas or [])
        if not m.ehObrigatorio
    ]
    optional_completed = sum(1 for m in optional_paths if m.status == "CONCLUIDO")
    equity_ratio = int((optional_completed / len(optional_paths)) * 100) if optional_paths else 0

    bot_sessions = len(sessoes)
    bot_touch_rate = int((bot_sessions / (total_users or 1)) * 100)

    return {
        "esgRadar": {
            "sustainablePace": sustainable_pace,
            "greenLearningHours": round(len(green_courses) * 1.5, 1),
            "missionsCompleted": missions_completed,
            "carbonAlerts": carbon_alerts,
        },
        "inclusionPulse": {
            "belongingIndex": belonging_index,
            "diversityIndex": diversity_index,
            "agentStories": len(sessoes),
        },
        "talentEquity": {
            "equityRatio": equity_ratio,
            "optionalTracks": len(optional_paths),
            "fastTrackers": optional_completed,
        },
        "botAssistants": {
            "activeSessions": bot_sessions,
            "coverage": min(100, bot_touch_rate),
            "signatureUseCases": ["Onboarding ético", "Escuta ativa", "Mentoria verde"],
        },
    }
