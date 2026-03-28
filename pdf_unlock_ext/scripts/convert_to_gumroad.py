import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# 1. Replace Imports
# Remove ExtPay and Crown/Star if we want, or keep them. Let's add Key, ExternalLink.
content = re.sub(
    r"import { (.*?) } from 'lucide-react';",
    r"import { \1, Key, ExternalLink } from 'lucide-react';",
    content
)
content = re.sub(r"import ExtPay from 'extpay';\n", "", content)
content = re.sub(r"const extpay = ExtPay\('pdf-unlocker-demo-pro'\);\n", "", content)

# 2. Add Gumroad Constants
constants = """
// GUMROAD SETTINGS
const GUMROAD_PRODUCT_PERMALINK = 'your_product_permalink'; // e.g., 'pdfunlocker'
const GUMROAD_STORE_URL = 'https://yourname.gumroad.com/l/your_product_permalink';
"""
content = re.sub(r"export default function App\(\) {", constants + "\nexport default function App() {", content)

# 3. Update States
bad_states = """  const [user, setUser] = useState<any>(null);
  const [unlocksUsed, setUnlocksUsed] = useState(0);
  const MAX_FREE_UNLOCKS = 2;"""
good_states = """  const [isPremium, setIsPremium] = useState(false);
  const [unlocksUsed, setUnlocksUsed] = useState(0);
  const [licenseKeyInput, setLicenseKeyInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [licenseError, setLicenseError] = useState<string | null>(null);
  const MAX_FREE_UNLOCKS = 2;"""
content = content.replace(bad_states, good_states)

# 4. Update Initialization
bad_init = """    // Get ExtPay user status
    extpay.getUser().then(user => setUser(user)).catch(err => console.log('ExtPay init error:', err));
    
    // Get usage from local storage
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['unlocksUsed'], (res) => {
        if (typeof res.unlocksUsed === 'number') setUnlocksUsed(res.unlocksUsed);
      });
    }"""
good_init = """    // Get usage & premium status from local storage
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['unlocksUsed', 'isPremium'], (res) => {
        if (typeof res.unlocksUsed === 'number') setUnlocksUsed(res.unlocksUsed);
        if (typeof res.isPremium === 'boolean') setIsPremium(res.isPremium);
      });
    }"""
content = content.replace(bad_init, good_init)

# 5. Update handleFileSelect logic
bad_handle = """  const handleFileSelect = async (selectedFile: File) => {
    if (unlocksUsed >= MAX_FREE_UNLOCKS && (!user || !user.paid)) {
      setStatus('premium_required');
      return;
    }"""
good_handle = """  const handleFileSelect = async (selectedFile: File) => {
    if (unlocksUsed >= MAX_FREE_UNLOCKS && !isPremium) {
      setStatus('premium_required');
      return;
    }"""
content = content.replace(bad_handle, good_handle)

# 6. Replace Premium Required UI block AND add verifyLicense function
verify_func = """  const verifyLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKeyInput.trim()) return;
    
    setIsVerifying(true);
    setLicenseError(null);
    
    try {
      const response = await fetch('https://api.gumroad.com/v2/licenses/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          product_permalink: GUMROAD_PRODUCT_PERMALINK,
          license_key: licenseKeyInput.trim()
        })
      });
      
      const data = await response.json();
      
      if (data.success && data.purchase && !data.purchase.refunded && !data.purchase.chargebacked) {
        setIsPremium(true);
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ isPremium: true });
        }
        setStatus('idle'); // go back to start
      } else {
        setLicenseError(data.message || 'Invalid or inactive license key.');
      }
    } catch (err) {
      setLicenseError('Network error. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDrop"""
content = content.replace("  const handleDrop", verify_func)

bad_premium_ui = """                <div className="w-full flex flex-col gap-3">
                  <button
                    onClick={() => extpay.openPaymentPage()}
                    className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-yellow-600 hover:bg-yellow-700 transition-colors"
                  >
                    <Star className="w-5 h-5 mr-2" />
                    Upgrade to Premium
                  </button>
                  <button
                    onClick={resetApp}
                    className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Go Back
                  </button>
                </div>"""

good_premium_ui = """                <form onSubmit={verifyLicense} className="w-full flex flex-col gap-3">
                  <a
                    href={GUMROAD_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-yellow-600 hover:bg-yellow-700 transition-colors"
                  >
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Get a License Key
                  </a>
                  
                  <div className="relative mt-2">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={licenseKeyInput}
                      onChange={(e) => setLicenseKeyInput(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                      placeholder="Paste your license key here"
                      required
                    />
                  </div>

                  {licenseError && (
                    <div className="text-red-500 text-xs font-semibold text-left w-full mt-1">
                      {licenseError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isVerifying}
                    className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white transition-colors ${
                      isVerifying ? 'bg-gray-400' : 'bg-gray-800 hover:bg-gray-900'
                    }`}
                  >
                    {isVerifying ? 'Verifying...' : 'Verify License'}
                  </button>
                  
                  <button
                    onClick={resetApp}
                    type="button"
                    className="w-full flex items-center justify-center py-3 px-4 mt-2 border border-gray-300 rounded-xl shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Go Back
                  </button>
                </form>"""

content = content.replace(bad_premium_ui, good_premium_ui)

with open('src/App.tsx', 'w') as f:
    f.write(content)

