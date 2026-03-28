with open('src/App.tsx', 'r') as f: content = f.read()

# Replace imports
content = content.replace("X } from 'lucide-react';", "X, Star, Crown } from 'lucide-react';\nimport ExtPay from 'extpay';\n\nconst extpay = ExtPay('pdf-unlocker-demo-pro');")

# Replace status
old_status = "const [status, setStatus] = useState<'idle' | 'checking' | 'password_required' | 'decrypting' | 'success' | 'error'>('idle');"
new_status = """const [status, setStatus] = useState<'idle' | 'checking' | 'password_required' | 'decrypting' | 'success' | 'error' | 'premium_required'>('idle');
  const [user, setUser] = useState<any>(null);
  const [unlocksUsed, setUnlocksUsed] = useState(0);
  const MAX_FREE_UNLOCKS = 2;"""
content = content.replace(old_status, new_status)

# Add useEffect hook for initialization
hook = """  useEffect(() => {
    // Get ExtPay user status
    extpay.getUser().then(user => setUser(user)).catch(err => console.log('ExtPay init error:', err));
    
    // Get usage from local storage
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['unlocksUsed'], (res) => {
        if (typeof res.unlocksUsed === 'number') setUnlocksUsed(res.unlocksUsed);
      });
    }
  }, []);

  useEffect(() => {"""
content = content.replace('  useEffect(() => {', hook, 1)

# Add checks to handleFileSelect
old_handle = """  const handleFileSelect = async (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {"""
new_handle = """  const handleFileSelect = async (selectedFile: File) => {
    if (unlocksUsed >= MAX_FREE_UNLOCKS && (!user || !user.paid)) {
      setStatus('premium_required');
      return;
    }

    if (selectedFile.type !== 'application/pdf') {"""
content = content.replace(old_handle, new_handle)

# Update storage on decryption success
old_dec = """        setDecryptedUrl(url);
        setStatus('success');"""
new_dec = """        setDecryptedUrl(url);
        setStatus('success');
        
        // update usage
        let newCount = unlocksUsed + 1;
        setUnlocksUsed(newCount);
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ unlocksUsed: newCount });
        }"""
content = content.replace(old_dec, new_dec)

with open('src/App.tsx', 'w') as f: f.write(content)
