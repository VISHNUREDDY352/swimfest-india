"""
Generate PDFs from Markdown docs using Markdown + HTML + Chrome headless
Run: python docs/generate_pdf.py
"""
import subprocess
import os
import markdown

docs_dir = os.path.dirname(os.path.abspath(__file__))

files = [
    ('Project_Report.md', 'Project_Report.pdf'),
    ('User_Manual.md', 'User_Manual.pdf'),
]

CSS = """
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #1a1a1a; margin: 0; padding: 0; }
  .page { max-width: 860px; margin: 0 auto; padding: 40px 50px; }
  h1 { color: #0a1628; font-size: 24px; border-bottom: 3px solid #1d4ed8; padding-bottom: 8px; margin-top: 30px; }
  h2 { color: #1d4ed8; font-size: 18px; margin-top: 24px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
  h3 { color: #0a1628; font-size: 15px; margin-top: 18px; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 12px; }
  th { background: #0a1628; color: white; padding: 8px 12px; text-align: left; }
  td { padding: 7px 12px; border-bottom: 1px solid #e2e8f0; }
  tr:nth-child(even) td { background: #f8fafc; }
  code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 12px; }
  pre { background: #f1f5f9; padding: 14px; border-radius: 6px; overflow-x: auto; font-size: 12px; }
  pre code { background: none; padding: 0; }
  blockquote { border-left: 4px solid #1d4ed8; margin: 12px 0; padding: 8px 16px; background: #eff6ff; color: #374151; }
  hr { border: none; border-top: 2px solid #e2e8f0; margin: 24px 0; }
  ul, ol { padding-left: 24px; }
  li { margin-bottom: 4px; }
  p { line-height: 1.6; margin: 8px 0; }
  @media print {
    @page { size: A4; margin: 15mm 15mm; }
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    h1, h2 { page-break-after: avoid; }
    table { page-break-inside: avoid; }
  }
</style>
"""

for md_file, pdf_file in files:
    md_path = os.path.join(docs_dir, md_file)
    html_path = os.path.join(docs_dir, md_file.replace('.md', '.html'))
    pdf_path = os.path.join(docs_dir, pdf_file)

    # Read markdown
    with open(md_path, 'r', encoding='utf-8') as f:
        md_content = f.read()

    # Convert to HTML
    html_body = markdown.markdown(md_content, extensions=['tables', 'fenced_code'])
    html_full = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>{md_file.replace('.md','')}</title>
  {CSS}
</head>
<body>
<div class="page">
{html_body}
</div>
</body>
</html>"""

    # Write HTML file
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html_full)

    print(f"Generated HTML: {html_path}")

    # Try Chrome/Edge headless to print PDF
    chrome_paths = [
        r'C:\Program Files\Google\Chrome\Application\chrome.exe',
        r'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe',
        r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
        r'C:\Program Files\Microsoft\Edge\Application\msedge.exe',
    ]

    chrome_exe = None
    for p in chrome_paths:
        if os.path.exists(p):
            chrome_exe = p
            break

    if chrome_exe:
        cmd = [
            chrome_exe,
            '--headless',
            '--disable-gpu',
            '--no-sandbox',
            f'--print-to-pdf={pdf_path}',
            '--print-to-pdf-no-header',
            html_path
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        if os.path.exists(pdf_path):
            print(f"✅ PDF created: {pdf_path}")
        else:
            print(f"❌ PDF failed. Open the HTML file manually and print to PDF:")
            print(f"   {html_path}")
    else:
        print(f"Chrome/Edge not found. Open this file in browser and print to PDF:")
        print(f"   {html_path}")

print("\nDone! Check docs/ folder for HTML and PDF files.")
