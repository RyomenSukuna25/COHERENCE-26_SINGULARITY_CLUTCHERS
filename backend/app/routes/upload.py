from fastapi import APIRouter, UploadFile
import pandas as pd

router = APIRouter()

@router.post("/upload-leads")
async def upload_leads(file: UploadFile):
    df = pd.read_excel(file.file)
    leads = df.to_dict(orient="records")

    return {
        "total_leads": len(leads),
        "leads": leads
    }