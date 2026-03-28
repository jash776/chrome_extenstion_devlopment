import re
with open('src/App.tsx', 'r') as f: content = f.read()

bad = """        // update usage
        let newCount = unlocksUsed + 1;
        setUnlocksUsed(newCount);
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ unlocksUsed: newCount });
        }
        
        // update usage
        let newCount = unlocksUsed + 1;
        setUnlocksUsed(newCount);
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ unlocksUsed: newCount });
        }
          setStatus('error');
        }
      }
    } catch (err) {"""

good = """        // update usage
        let newCount = unlocksUsed + 1;
        setUnlocksUsed(newCount);
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ unlocksUsed: newCount });
        }

      } catch (e: any) {
        if (e.message.includes('Password incorrect') || e.message.includes('password')) {
          setError('Incorrect password. Please try again.');
          setStatus('password_required');
        } else {
          setError('Failed to decrypt the PDF. ' + e.message);
          setStatus('error');
        }
      }
    } catch (err) {"""

content = content.replace(bad, good)
with open('src/App.tsx', 'w') as f: f.write(content)
