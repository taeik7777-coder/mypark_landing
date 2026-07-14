import json
import re

log_file = r"C:\Users\Administrator\.gemini\antigravity-ide\brain\dafc8ac3-29a7-4094-ab53-ef18774f3f57\.system_generated\logs\transcript.jsonl"
out_file = r"C:\Users\Administrator\Desktop\mypark_landing_real\style.css"

chunks = []

with open(log_file, "r", encoding="utf-8") as f:
    for line_idx, line in enumerate(f):
        if "VIEW_FILE" not in line or "style.css" not in line:
            continue
        try:
            data = json.loads(line)
            if data.get("type") == "VIEW_FILE" and data.get("status") == "DONE":
                content = data.get("content", "")
                if "style.css" in content and "Showing lines" in content:
                    print(f"Found view_file at line {line_idx}")
                    match = re.search(r"Showing lines (\d+) to (\d+)", content)
                    if match:
                        start = int(match.group(1))
                        end = int(match.group(2))
                        print(f"Start: {start}, End: {end}")
                        
                        code_match = re.search(r"leading space\.\r?\n(.*)", content, re.DOTALL)
                        if code_match:
                            code_part = code_match.group(1)
                            end_str = "The above content does NOT show the entire file contents"
                            if end_str in code_part:
                                code_part = code_part.split(end_str)[0]
                            
                            cleaned_lines = []
                            for line_text in code_part.splitlines():
                                cleaned = re.sub(r"^\d+:\s", "", line_text)
                                cleaned_lines.append(cleaned)
                            
                            chunks.append((start, end, "\n".join(cleaned_lines)))
                        else:
                            print("Regex for code part failed")
        except Exception as e:
            pass

print(f"Found {len(chunks)} chunks.")
if chunks:
    chunks.sort(key=lambda x: x[0])
    merged_lines = {}
    for start, end, text in chunks:
        lines = text.split("\n")
        for i, line_text in enumerate(lines):
            line_num = start + i
            if line_num not in merged_lines:
                merged_lines[line_num] = line_text

    with open(out_file, "w", encoding="utf-8") as f:
        for i in range(1, max(merged_lines.keys()) + 1):
            f.write(merged_lines.get(i, "") + "\n")
    print(f"Recovered {len(merged_lines)} lines.")
