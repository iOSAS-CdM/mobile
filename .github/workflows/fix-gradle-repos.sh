#!/bin/bash
set -e

echo "Fixing Android repository configuration..."

# Create a Python script to fix the gradle repositories
python3 << 'PYTHON_SCRIPT'
import re

# Read the build.gradle file
with open('android/build.gradle', 'r') as f:
    content = f.read()

print("Original allprojects block found:")
allprojects_match = re.search(r'allprojects\s*\{.*?^\}', content, re.MULTILINE | re.DOTALL)
if allprojects_match:
    print(allprojects_match.group(0)[:200] + "...")

# Strategy: Replace the entire allprojects block with a clean one
new_allprojects = '''allprojects {
    repositories {
        google()
        mavenCentral()
        maven {
            url "https://www.jitpack.io"
            content {
                includeGroupByRegex('com\\\\.github\\\\..*')
            }
        }
    }
}'''

# Replace the allprojects block
content = re.sub(
    r'allprojects\s*\{.*?^\}',
    new_allprojects,
    content,
    flags=re.MULTILINE | re.DOTALL
)

# Write back
with open('android/build.gradle', 'w') as f:
    f.write(content)

print("\n✅ Repository configuration fixed!")
print("\nNew allprojects block:")
print(new_allprojects)
PYTHON_SCRIPT

echo ""
echo "=== Verification ==="
grep -A 15 "allprojects" android/build.gradle || echo "allprojects block not found"
echo "===================="
