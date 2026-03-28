with open('src/App.tsx', 'r') as f: content = f.read()

dup = """        let newCount = unlocksUsed + 1;
        setUnlocksUsed(newCount);
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ unlocksUsed: newCount });
        }"""

content = content.replace(dup + "\n        \n" + dup, dup)
with open('src/App.tsx', 'w') as f: f.write(content)
