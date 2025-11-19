from __future__ import annotations

from datetime import datetime, timedelta
from statistics import mean
from typing import Any, Dict, List, Optional

from prisma import Prisma

from backend.experiments import ml_models


class PredictiveLab:
    """
    Camada "BioDigital Twin" que treina modelos clássicos e neurais usando
    exclusivamente os dados já registrados na tabela checkins_bio.
    """

    def __init__(self) -> None:
        self.last_trained_at: Optional[datetime] = None
        self.dataset_size: int = 0
        self.feature_snapshot: List[Dict[str, Any]] = []

    async def _fetch_rows(self, db: Prisma) -> List[Dict[str, Any]]:
        checkins = await db.checkinbio.find_many()
        rows: List[Dict[str, Any]] = []
        for c in checkins:
            rows.append(
                {
                    "horasSono": c.horasSono or 0,
                    "qualidadeSono": c.qualidadeSono or 0,
                    "nivelFadiga": c.nivelFadiga or 0,
                    "nivelEstresse": c.nivelEstresse or 0,
                    "nivelFoco": c.nivelFoco or 0,
                    "userId": c.idUsuario,
                    "dataHora": c.dataHora,
                }
            )
        return rows

    async def refresh(self, db: Prisma) -> None:
        rows = await self._fetch_rows(db)
        self.dataset_size = len(rows)
        self.feature_snapshot = rows
        if rows:
            ml_models.train_models(rows)
            self.last_trained_at = datetime.utcnow()

    async def ensure_trained(self, db: Prisma) -> None:
        needs_refresh = False
        if not self.last_trained_at:
            needs_refresh = True
        elif not self.feature_snapshot:
            needs_refresh = True
        else:
            needs_refresh = datetime.utcnow() - self.last_trained_at > timedelta(minutes=20)
        if needs_refresh:
            await self.refresh(db)

    async def _sample_from_user(self, db: Prisma, user_id: str) -> Optional[Dict[str, Any]]:
        checkins = await db.checkinbio.find_many(
            where={"idUsuario": user_id},
            order={"dataHora": "desc"}
        )
        if not checkins:
            return None
        latest = checkins[0]
        return {
            "horasSono": latest.horasSono or 0,
            "qualidadeSono": latest.qualidadeSono or 0,
            "nivelFadiga": latest.nivelFadiga or 0,
        }

    def _organization_baseline(self) -> Dict[str, Any]:
        if not self.feature_snapshot:
            return ml_models.feature_template()
        horas = [row.get("horasSono", 0) for row in self.feature_snapshot]
        qualidade = [row.get("qualidadeSono", 0) for row in self.feature_snapshot]
        fadiga = [row.get("nivelFadiga", 0) for row in self.feature_snapshot]
        return {
            "horasSono": mean(horas) if horas else 0,
            "qualidadeSono": mean(qualidade) if qualidade else 0,
            "nivelFadiga": mean(fadiga) if fadiga else 0,
        }

    async def predict_for_user(self, db: Prisma, user_id: Optional[str]) -> Dict[str, Any]:
        await self.ensure_trained(db)
        sample = None
        if user_id:
            sample = await self._sample_from_user(db, user_id)
        if not sample:
            sample = self._organization_baseline()
        projections = ml_models.predict(sample)
        return {
            "inputs": sample,
            "projection": projections,
            "recommendedMode": self._mode_from_projection(projections),
            "confidence": self._confidence(),
            "trainedAt": self.last_trained_at.isoformat() if self.last_trained_at else None,
            "datasetSize": self.dataset_size,
        }

    def _confidence(self) -> int:
        if not self.dataset_size:
            return 0
        capped = min(self.dataset_size, 200)
        return int((capped / 200) * 100)

    def _mode_from_projection(self, projections: Dict[str, float]) -> str:
        stress = projections.get("stress", 0)
        focus = projections.get("focus", 0)
        if stress > 70:
            return "PAUSA_GUIADA"
        if focus > 75:
            return "MICRO_APRENDIZADO"
        return "ALTA_PERFORMANCE"

    async def organization_snapshot(self, db: Prisma) -> Dict[str, Any]:
        await self.ensure_trained(db)
        baseline = self._organization_baseline()
        projections = ml_models.predict(baseline)

        teams = await db.equipe.find_many(include={"usuarios": {"include": {"checkInsBio": True}}})
        team_heatmap = []
        for team in teams:
            checkins = []
            for usuario in team.usuarios or []:
                checkins.extend(usuario.checkInsBio or [])
            if not checkins:
                continue
            stress_avg = mean(c.nivelEstresse or 0 for c in checkins)
            focus_avg = mean(c.nivelFoco or 0 for c in checkins)
            team_heatmap.append(
                {
                    "teamId": team.id,
                    "teamName": team.nome,
                    "stressRisk": round(stress_avg, 1),
                    "focusScore": round(focus_avg, 1),
                    "recommendation": self._mode_from_projection({"stress": stress_avg, "focus": focus_avg}),
                }
            )

        stress_values = [entry["stressRisk"] for entry in team_heatmap] or [projections.get("stress", 0)]
        stress_avg = mean(stress_values)

        return {
            "trainedAt": self.last_trained_at.isoformat() if self.last_trained_at else None,
            "datasetSize": self.dataset_size,
            "orgProjection": projections,
            "confidence": self._confidence(),
            "stressAverage": stress_avg,
            "teamHeatmap": team_heatmap,
            "topSignals": self._signals(),
        }

    def _signals(self) -> List[Dict[str, Any]]:
        if not self.feature_snapshot:
            return []
        horas_baixas = sum(1 for row in self.feature_snapshot if (row.get("horasSono") or 0) < 6)
        alta_fadiga = sum(1 for row in self.feature_snapshot if (row.get("nivelFadiga") or 0) > 70)
        boa_qualidade = sum(1 for row in self.feature_snapshot if (row.get("qualidadeSono") or 0) >= 8)
        total = len(self.feature_snapshot) or 1
        return [
            {"label": "Sono < 6h", "impact": int((horas_baixas / total) * 100), "action": "Liberar pausas de foco"},
            {"label": "Fadiga elevada", "impact": int((alta_fadiga / total) * 100), "action": "Agendar telemetria com IA Coach"},
            {"label": "Sono regenerativo", "impact": int((boa_qualidade / total) * 100), "action": "Escalar microlearning verde"},
        ]


predictive_lab = PredictiveLab()
