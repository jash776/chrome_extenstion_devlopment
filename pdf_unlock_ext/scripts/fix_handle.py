import re
with open('src/App.tsx', 'r') as f: content = f.read()

bad_str = """  const handleFileSelect = async (selectedFile: File) => {
      setStatus('premium_required');
      return;
    }"""

fixed_str = """  const handleFileSelect = async (selectedFile: File) => {
    if (unlocksUsed >= MAX_FREE_UNLOCKS && (!user || !user.paid)) {
      setStatus('premium_required');
      return;
    }"""

content = content.replace(bad_str, fixed_str)
with open('src/App.tsx', 'w') as f: f.write(content)
