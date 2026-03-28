import re
with open('src/App.tsx', 'r') as f: content = f.read()

premium_html = """            {/* PREMIUM REQUIRED STATE */}
            {status === 'premium_required' && (
              <motion.div
                key="premium"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                  <Crown className="w-10 h-10 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Free Limit Reached</h3>
                <p className="text-gray-500 text-sm mb-6">You have used your 2 free PDF unlocks. Upgrade to Premium for unlimited use.</p>
                
                <div className="w-full flex flex-col gap-3">
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
                </div>
              </motion.div>
            )}
"""

content = content.replace("            {/* ERROR STATE (General) */}", premium_html + "\n            {/* ERROR STATE (General) */}")

with open('src/App.tsx', 'w') as f: f.write(content)
