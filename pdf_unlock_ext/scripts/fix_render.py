import re
with open('src/App.tsx', 'r') as f: content = f.read()

# Remove the duplicated PREMIUM REQUIRED STATE blocks except the first one
parts = content.split('            {/* PREMIUM REQUIRED STATE */}')

if len(parts) > 2:
    # There's a duplicate block
    print("Found duplicated blocks, cleaning up...")
    good_content = parts[0] + '            {/* PREMIUM REQUIRED STATE */}' + parts[1]
    
    # Check if there is an ERROR STATE block in the last part that we shouldn't lose
    if '{/* ERROR STATE' in parts[2]:
        error_part = '{/* ERROR STATE' + parts[2].split('{/* ERROR STATE')[1]
        good_content += error_part
    else:
        # Just close the tags
        good_content += """

            {/* ERROR STATE (General) */}
            {status === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center text-center py-6"
              >
                <div className="bg-red-50 p-4 rounded-full mb-4">
                  <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Error</h3>
                <p className="text-gray-600 text-sm mb-6">{error}</p>
                <button
                  onClick={resetApp}
                  className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Go Back
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
"""
    with open('src/App.tsx', 'w') as f: f.write(good_content)
else:
    print("No duplicates found")
