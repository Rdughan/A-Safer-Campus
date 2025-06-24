import joblib
from sklearn.datasets import make_classification
from sklearn.ensemble import RandomForestClassifier
import pandas as pd

# Simulate dataset
X, y = make_classification(n_samples=200, n_features=8, n_informative=6, n_redundant=2, random_state=42)
columns = [
    "user_report_count", "user_false_history", "location_repeat_rate",
    "incident_time_hour", "incident_type_encoded", "severity_level",
    "confirmation_votes", "report_age_minutes"
]
df = pd.DataFrame(X, columns=columns)
df["is_false_report"] = y

# Train model
X_train = df.drop("is_false_report", axis=1)
y_train = df["is_false_report"]
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Save model
joblib.dump(model, "false_report_detector.pkl")
print("Model saved as false_report_detector.pkl")
