import pdfplumber
import re
from typing import Dict, Optional

LAB_PATTERNS = {
    "insulin":      r"insulin[^\d]*(\d+\.?\d*)",
    "testosterone": r"testosterone[^\d]*(\d+\.?\d*)",
    "lh_fsh_ratio": r"lh[\s/]*fsh[^\d]*(\d+\.?\d*)",
    "amh":          r"amh[^\d]*(\d+\.?\d*)",
    "glucose":      r"(?:fasting\s+)?glucose[^\d]*(\d+\.?\d*)",
}

def parse_lab_report(file_bytes: bytes) -> Dict[str, Optional[float]]:
    extracted: Dict[str, Optional[float]] = {
        "insulin": None,
        "testosterone": None,
        "lh_fsh_ratio": None,
        "amh": None,
        "glucose": None
    }
    
    try:
        import io
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            full_text = ""
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    full_text += text + "\n"
                    
            full_text = full_text.lower()
            
            for key, pattern in LAB_PATTERNS.items():
                match = re.search(pattern, full_text)
                if match:
                    try:
                        extracted[key] = float(match.group(1))
                    except ValueError:
                        pass
                        
    except Exception as e:
        # Never crash on lab parsing
        import logging
        logging.getLogger(__name__).warning(f"Lab parsing error: {e}")
        
    return extracted
