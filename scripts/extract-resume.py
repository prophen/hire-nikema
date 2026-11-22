"""Refresh the agent's résumé text. Requires: python3 -m pip install pypdf."""
import hashlib
import json
from pathlib import Path
from pypdf import PdfReader

root = Path(__file__).resolve().parent.parent
pdf = root / 'public/Nikema_Prophet_Resume.pdf'
text = '\n\n'.join(page.extract_text() or '' for page in PdfReader(pdf).pages)
if not text.strip():
    raise SystemExit('No text extracted; review the PDF before updating agent knowledge.')
(root / 'server/resume.json').write_text(json.dumps({
    'sha256': hashlib.sha256(pdf.read_bytes()).hexdigest(), 'text': text,
}, indent=2) + '\n')
print('Updated server/resume.json. Review the text before deploying.')
