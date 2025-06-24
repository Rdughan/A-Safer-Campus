from fastapi import FastAPI,Request
from pydantic import BaseModel
import joblib
import numpy as np

app = FastAPI()

# Load the trained model
model = joblib.load("false_report_detector.pkl")

# Define the input data format
class ReportData(BaseModel):
    user_report_count: float
    user_false_history: float
    location_repeat_rate: float
    incident_time_hour: float
    incident_type_encoded: float
    severity_level: float
    confirmation_votes: float
    report_age_minutes: float

@app.post("/predict")
def predict_report(report: ReportData):
    data = np.array([[report.user_report_count,
                      report.user_false_history,
                      report.location_repeat_rate,
                      report.incident_time_hour,
                      report.incident_type_encoded,
                      report.severity_level,
                      report.confirmation_votes,
                      report.report_age_minutes]])
    prediction = model.predict(data)[0]
    return {"is_false_report": int(prediction)}

class SummarizeRequest(BaseModel):
    transcript: str
    type: str
    location: str
    severity: str
    timestamp: str

@app.post("/summarize")
def summarize(req: SummarizeRequest):
    # Simple example: return the first sentence as the summary
    transcript = req.transcript
    summary = transcript.split('.')[0] if '.' in transcript else transcript
    return {"summary": summary,
    "type": req.type,
    "location": req.location,
    "severity":req.severity,
    "original":transcript,
    "timestamp":req.timestamp}    
