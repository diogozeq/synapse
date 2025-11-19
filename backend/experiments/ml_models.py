from typing import Any, Dict, List, Sequence

stress_model = None
focus_model = None
torch_model = None
FEATURE_KEYS = ("horasSono", "qualidadeSono", "nivelFadiga")


def _to_dataset(rows: Sequence[Dict[str, Any]]):
    X: List[List[float]] = []
    ys: List[int] = []
    yf: List[float] = []
    for row in rows:
        features = [float(row.get(key) or 0) for key in FEATURE_KEYS]
        stress = row.get("nivelEstresse") or 0
        focus = row.get("nivelFoco") or 0
        X.append(features)
        ys.append(1 if float(stress) >= 70 else 0)
        yf.append(float(focus) / 100.0)
    return X, ys, yf


def train_models(rows: Sequence[Dict[str, Any]]) -> None:
    """
    Treina modelos clássicos + um micro MLP para prever risco de estresse e curva de foco.
    """
    global stress_model, focus_model, torch_model
    X, ys, yf = _to_dataset(rows)
    if len(X) < 5:
        stress_model = None
        focus_model = None
        torch_model = None
        return
    try:
        from sklearn.linear_model import LogisticRegression
        from sklearn.ensemble import RandomForestRegressor

        stress_model = LogisticRegression(max_iter=1000)
        stress_model.fit(X, ys)
        focus_model = RandomForestRegressor(n_estimators=120, random_state=42)
        focus_model.fit(X, yf)
    except Exception:
        stress_model = None
        focus_model = None

    try:
        import torch
        import torch.nn as nn

        class Net(nn.Module):
            def __init__(self):
                super().__init__()
                self.fc1 = nn.Linear(len(FEATURE_KEYS), 24)
                self.fc2 = nn.Linear(24, 12)
                self.out = nn.Linear(12, 2)

            def forward(self, x):
                x = torch.relu(self.fc1(x))
                x = torch.relu(self.fc2(x))
                return self.out(x)

        if len(X) >= 5:
            torch_model = Net()
            opt = torch.optim.Adam(torch_model.parameters(), lr=0.01)
            loss_fn = nn.MSELoss()
            inputs = torch.tensor(X, dtype=torch.float32)
            targets = torch.tensor(
                [[float(y), float(f)] for y, f in zip(ys, yf)], dtype=torch.float32
            )
            for _ in range(80):
                opt.zero_grad()
                out = torch_model(inputs)
                loss = loss_fn(out, targets)
                loss.backward()
                opt.step()
        else:
            torch_model = None
    except Exception:
        torch_model = None


def predict(sample: Dict[str, Any]) -> Dict[str, float]:
    """
    Recebe um dicionário com as features do colaborador e retorna projeções (%).
    """
    x = [float(sample.get(key, 0)) for key in FEATURE_KEYS]
    s = 0.5
    f = 0.5
    try:
        if stress_model is not None:
            s = float(stress_model.predict_proba([x])[0][1])
        if focus_model is not None:
            f = float(focus_model.predict([x])[0])
    except Exception:
        pass
    try:
        import torch

        if torch_model is not None:
            with torch.no_grad():
                out = torch_model(torch.tensor([x], dtype=torch.float32))[0]
                s = float(out[0].item())
                f = float(out[1].item())
    except Exception:
        pass
    s_clamped = max(0.0, min(1.0, s))
    f_clamped = max(0.0, min(1.0, f))
    return {"stress": s_clamped * 100.0, "focus": f_clamped * 100.0}


def feature_template() -> Dict[str, float]:
    return {key: 0.0 for key in FEATURE_KEYS}
