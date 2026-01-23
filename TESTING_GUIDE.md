# 🧪 Zcafe App - Testing Guide

## Quick Test (2 minutes)

### 1. Check the App is Running
✅ Development server is running at: http://localhost:3000

### 2. Open Browser DevTools
- Press `F12` or `Ctrl+Shift+I` (Windows)
- Go to **Console** tab

### 3. Look for These Messages
You should see:
```
[Performance] Optimizations initialized
[Performance] Reduced motion enabled (if applicable)
[Performance] Low-end device optimizations enabled (if applicable)
[PWA] Standalone detection: {...}
```

### 4. Check for NO Errors
- ✅ No red errors in console
- ✅ No CSS file not found errors
- ✅ No duplicate style warnings

## Detailed Testing

### Test 1: Animation Performance

1. **Open the app** at http://localhost:3000
2. **Watch the infinite scroll** (product cards)
3. **Check DevTools Performance tab**:
   - Click **Record** button
   - Let it record for 5 seconds
   - Click **Stop**
   - Check if FPS is consistently **60fps**

**Expected Result**: Smooth 60fps animation, no janking

### Test 2: Lazy Loading

1. **Open Network tab** in DevTools
2. **Reload the page**
3. **Count image requests** - should be ~5-8 initially
4. **Scroll down slowly**
5. **Watch new images load** as you scroll

**Expected Result**: Images load progressively, not all at once

### Test 3: Power Optimization

1. **Open the app**
2. **Switch to a different tab** (hide the Zcafe tab)
3. **Check Console** - should see: `[Performance] Animations paused (page hidden)`
4. **Switch back to Zcafe tab**
5. **Check Console** - should see: `[Performance] Animations resumed (page visible)`

**Expected Result**: Animations pause when tab is hidden

### Test 4: Responsive Design

#### Desktop (> 761px)
```powershell
# Open in browser at http://localhost:3000
# Resize browser window to > 761px width
```
- ✅ Desktop layout shows
- ✅ Large product cards
- ✅ Banner is 600px height
- ✅ 4-column product grid

#### Mobile (< 760px)
```powershell
# Resize browser window to < 760px width
# OR use DevTools Device Toolbar (Ctrl+Shift+M)
```
- ✅ Mobile layout shows
- ✅ Bottom navigation appears
- ✅ Smaller product cards
- ✅ Banner is 160px height
- ✅ 2-column product grid

### Test 5: Performance Metrics

1. **Open Lighthouse** in DevTools
   - DevTools → Lighthouse tab
   - Select "Desktop" or "Mobile"
   - Check only "Performance"
   - Click "Analyze page load"

2. **Check Scores** (should be):
   - **Performance**: > 90
   - **LCP**: < 2.5s
   - **FID**: < 100ms
   - **CLS**: < 0.1

### Test 6: Low-End Device Simulation

1. **Open DevTools**
2. **Go to Performance tab**
3. **Click Settings icon** (gear)
4. **Enable**: "CPU: 4x slowdown"
5. **Reload page**

**Expected Result**: 
- App should still be usable
- Animations might be slower but smooth
- No frozen UI

## Mobile Device Testing

### iOS Testing

1. **Open Safari** on iPhone
2. **Navigate to**: `http://YOUR_IP:3000`
3. **Test**:
   - ✅ Scroll smoothly
   - ✅ Videos play inline
   - ✅ No black banners
   - ✅ Touch interactions work
   - ✅ Add to Home Screen works

### Android Testing

1. **Open Chrome** on Android
2. **Navigate to**: `http://YOUR_IP:3000`
3. **Test**:
   - ✅ Scroll smoothly
   - ✅ Videos play inline
   - ✅ No black banners
   - ✅ Touch interactions work
   - ✅ Install app prompt appears

## Common Issues & Solutions

### Issue: Console shows "process is not defined"
**Solution**: This is normal in development mode with our performance monitoring code.

### Issue: Images not loading
**Solution**: 
```powershell
# Check if images exist in public folder
Get-ChildItem -Path d:\Zcafe\public\*.png
```

### Issue: Videos show black screen
**Solution**: 
- Check video files exist in public folder
- Ensure both `.webm` and `.mp4` formats are present
- Check browser console for video loading errors

### Issue: Animations not working
**Solution**:
1. Check if reduced motion is enabled in OS settings
2. Check console for device optimization messages
3. Disable browser extensions that might block animations

## Performance Benchmarks

### Expected Load Times

| Device Type | First Load | Subsequent |
|------------|-----------|-----------|
| Desktop (Fast) | < 1.5s | < 0.5s |
| Desktop (Slow) | < 2.5s | < 1.0s |
| Mobile (4G) | < 2.5s | < 1.0s |
| Mobile (3G) | < 4.0s | < 1.5s |

### Expected FPS

| Animation | Desktop | Mobile |
|-----------|---------|--------|
| Infinite Scroll | 60 fps | 60 fps |
| Modal Open | 60 fps | 60 fps |
| Banner Transition | 60 fps | 55-60 fps |
| Card Hover | 60 fps | N/A |

## Accessibility Testing

### Test Reduced Motion

1. **Windows**: Settings → Ease of Access → Display → "Show animations in Windows" OFF
2. **Mac**: System Preferences → Accessibility → Display → "Reduce motion" ON
3. **Reload app**
4. **Check**: Animations should be minimal or disabled

**Expected Result**: App respects reduced motion preference

## Browser Compatibility

### Tested & Working ✅
- Chrome 90+
- Edge 90+
- Firefox 88+
- Safari 14+
- Chrome Mobile (Android)
- Safari Mobile (iOS)

### Not Tested ⚠️
- Internet Explorer (not supported)
- Opera Mini
- UC Browser

## Quick Smoke Test Script

Run this in browser console after app loads:

```javascript
// Check if performance optimizations are active
console.log('Performance Status:');
console.log('Low-end device:', document.documentElement.classList.contains('low-end-device'));
console.log('Reduce motion:', document.documentElement.classList.contains('reduce-motion'));
console.log('Infinite scroll track:', document.querySelector('.infinite-scroll-track') ? 'Found' : 'Missing');
console.log('Lazy images:', document.querySelectorAll('img[loading="lazy"]').length);
```

**Expected Output**:
```
Performance Status:
Low-end device: true/false (depends on your device)
Reduce motion: true/false (depends on your preferences)
Infinite scroll track: Found
Lazy images: 8
```

## Production Build Test

Before deploying:

```powershell
# 1. Create production build
npm run build

# 2. Serve production build
npx serve -s dist

# 3. Test at http://localhost:3000 (or whatever port serve uses)

# 4. Run Lighthouse on production build
# Should score higher than dev build
```

## Final Checklist

Before marking as complete:

- [ ] No console errors on page load
- [ ] All images load correctly
- [ ] Videos play without black screens
- [ ] Lazy loading works
- [ ] Animations are smooth (60fps)
- [ ] Animations pause when tab hidden
- [ ] Responsive design works (mobile & desktop)
- [ ] Performance score > 90 (Lighthouse)
- [ ] Works on real mobile device (iOS or Android)
- [ ] PWA installation works
- [ ] Touch interactions feel natural on mobile

---

## 🎯 Success Criteria

Your app is optimized if:
1. ✅ Lighthouse Performance Score > 90
2. ✅ Smooth 60fps animations
3. ✅ Fast load times (< 2.5s on mobile)
4. ✅ No layout shifts
5. ✅ Works perfectly on low-end devices
6. ✅ Respects accessibility preferences
7. ✅ No console errors

**If all tests pass, your optimization is COMPLETE!** 🎉
