const { chromium } = require('playwright');

async function testBilingualAdminPanel() {
    console.log('🚀 Starting bilingual admin panel tests...');
    
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    
    try {
        // Navigate to admin panel
        console.log('📍 Navigating to admin panel...');
        await page.goto('http://localhost:5000/admin');
        await page.waitForLoadState('networkidle');
        
        // Check if we need to login
        const passwordInput = page.locator('[data-testid="admin-password-input"]');
        if (await passwordInput.isVisible()) {
            console.log('🔐 Logging into admin panel...');
            await passwordInput.fill('admin123');
            await page.click('[data-testid="admin-login-button"]');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(2000);
        }
        
        // ========== TEST 1: Initial Layout in Persian (RTL) ==========
        console.log('\n📱 TEST 1: Testing initial layout in Persian (RTL)');
        await page.screenshot({ path: 'admin_test_1_persian_initial.png', fullPage: true });
        
        // Check if layout is RTL
        const htmlDir = await page.evaluate(() => document.documentElement.dir);
        console.log(`   Document direction: ${htmlDir}`);
        
        // Check sidebar visibility and positioning
        const sidebar = page.locator('.fixed.inset-y-0.z-50.w-64');
        const sidebarVisible = await sidebar.isVisible();
        console.log(`   Sidebar visible: ${sidebarVisible}`);
        
        // Check if main content has proper margin/padding for sidebar
        const mainContent = page.locator('main');
        const mainContentVisible = await mainContent.isVisible();
        console.log(`   Main content visible: ${mainContentVisible}`);
        
        // ========== TEST 2: Language Switching to English ==========
        console.log('\n🌐 TEST 2: Testing language switch to English');
        
        // Click language switcher
        await page.click('[data-testid="admin-language-switcher"]');
        await page.waitForTimeout(1000);
        
        // Switch to English
        await page.click('[data-testid="switch-to-english"]');
        await page.waitForTimeout(2000);
        await page.waitForLoadState('networkidle');
        
        // Take screenshot after language switch
        await page.screenshot({ path: 'admin_test_2_english_layout.png', fullPage: true });
        
        // Check if layout switched to LTR
        const htmlDirAfter = await page.evaluate(() => document.documentElement.dir);
        console.log(`   Document direction after switch: ${htmlDirAfter}`);
        
        // ========== TEST 3: Sidebar Functionality in English ==========
        console.log('\n📱 TEST 3: Testing sidebar functionality in English');
        
        // Test desktop sidebar (should not block content)
        const sidebarBlocking = await page.evaluate(() => {
            const sidebar = document.querySelector('.fixed.inset-y-0.z-50.w-64');
            const main = document.querySelector('main');
            if (!sidebar || !main) return 'Elements not found';
            
            const sidebarRect = sidebar.getBoundingClientRect();
            const mainRect = main.getBoundingClientRect();
            
            // Check if main content has proper left margin/padding
            const mainParent = main.parentElement;
            const computedStyle = window.getComputedStyle(mainParent);
            const paddingLeft = parseInt(computedStyle.paddingLeft) || 0;
            const marginLeft = parseInt(computedStyle.marginLeft) || 0;
            
            return {
                sidebarWidth: sidebarRect.width,
                mainLeft: mainRect.left,
                paddingLeft: paddingLeft,
                marginLeft: marginLeft,
                isBlocking: mainRect.left < sidebarRect.right,
                sidebarRight: sidebarRect.right
            };
        });
        console.log(`   Sidebar blocking analysis:`, sidebarBlocking);
        
        // ========== TEST 4: Navigation Menu Testing ==========
        console.log('\n🧭 TEST 4: Testing navigation in both languages');
        
        // Test navigation to different admin sections
        const adminSections = [
            { selector: '[data-testid="admin-nav-dashboard"]', name: 'Dashboard' },
            { selector: '[data-testid="admin-nav-products"]', name: 'Products' },
            { selector: '[data-testid="admin-nav-categories"]', name: 'Categories' },
            { selector: '[data-testid="admin-nav-blog"]', name: 'Blog' },
            { selector: '[data-testid="admin-nav-pages"]', name: 'Pages' },
        ];
        
        for (const section of adminSections) {
            console.log(`   Testing ${section.name} section...`);
            try {
                await page.click(section.selector);
                await page.waitForTimeout(1000);
                await page.waitForLoadState('networkidle');
                
                // Take screenshot of section
                await page.screenshot({ 
                    path: `admin_test_4_${section.name.toLowerCase()}_english.png`, 
                    fullPage: true 
                });
            } catch (e) {
                console.log(`   Error testing ${section.name}: ${e.message}`);
            }
        }
        
        // ========== TEST 5: Blog Sub-navigation ==========
        console.log('\n📝 TEST 5: Testing blog sub-navigation');
        
        // Click on blog to expand sub-menu
        await page.click('[data-testid="admin-nav-blog"]');
        await page.waitForTimeout(1000);
        
        const blogSubsections = [
            { selector: '[data-testid="admin-nav-blog-blog dashboard"]', name: 'Blog Dashboard' },
            { selector: '[data-testid="admin-nav-blog-blog posts"]', name: 'Blog Posts' },
            { selector: '[data-testid="admin-nav-blog-authors"]', name: 'Authors' },
            { selector: '[data-testid="admin-nav-blog-categories"]', name: 'Blog Categories' },
            { selector: '[data-testid="admin-nav-blog-tags"]', name: 'Tags' },
        ];
        
        for (const section of blogSubsections) {
            console.log(`   Testing ${section.name} subsection...`);
            try {
                const element = page.locator(section.selector);
                if (await element.isVisible()) {
                    await element.click();
                    await page.waitForTimeout(1000);
                    await page.waitForLoadState('networkidle');
                    
                    // Take screenshot
                    await page.screenshot({ 
                        path: `admin_test_5_${section.name.toLowerCase().replace(/\s+/g, '_')}_english.png`, 
                        fullPage: true 
                    });
                } else {
                    console.log(`   ${section.name} not visible, skipping...`);
                }
            } catch (e) {
                console.log(`   Error testing ${section.name}: ${e.message}`);
            }
        }
        
        // ========== TEST 6: Switch back to Persian ==========
        console.log('\n🌐 TEST 6: Testing switch back to Persian');
        
        // Switch back to Persian
        await page.click('[data-testid="admin-language-switcher"]');
        await page.waitForTimeout(1000);
        await page.click('[data-testid="switch-to-persian"]');
        await page.waitForTimeout(2000);
        await page.waitForLoadState('networkidle');
        
        // Take screenshot in Persian
        await page.screenshot({ path: 'admin_test_6_persian_return.png', fullPage: true });
        
        // Check RTL again
        const htmlDirPersian = await page.evaluate(() => document.documentElement.dir);
        console.log(`   Document direction back to Persian: ${htmlDirPersian}`);
        
        // ========== TEST 7: Mobile Responsiveness ==========
        console.log('\n📱 TEST 7: Testing mobile responsiveness');
        
        // Test mobile viewport in Persian
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'admin_test_7_mobile_persian.png', fullPage: true });
        
        // Test mobile menu button
        const mobileMenuBtn = page.locator('[data-testid="open-sidebar"]');
        if (await mobileMenuBtn.isVisible()) {
            console.log('   Mobile menu button visible - testing mobile sidebar');
            await mobileMenuBtn.click();
            await page.waitForTimeout(1000);
            await page.screenshot({ path: 'admin_test_7_mobile_sidebar_open.png', fullPage: true });
            
            // Close mobile sidebar
            const closeBtn = page.locator('[data-testid="close-sidebar"]');
            if (await closeBtn.isVisible()) {
                await closeBtn.click();
                await page.waitForTimeout(1000);
            }
        }
        
        // Switch to English in mobile
        await page.click('[data-testid="admin-language-switcher"]');
        await page.waitForTimeout(1000);
        await page.click('[data-testid="switch-to-english"]');
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'admin_test_7_mobile_english.png', fullPage: true });
        
        // ========== TEST 8: Desktop view final verification ==========
        console.log('\n🖥️ TEST 8: Final desktop verification');
        
        // Return to desktop view
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'admin_test_8_final_desktop.png', fullPage: true });
        
        console.log('\n✅ All tests completed successfully!');
        console.log('📸 Screenshots saved:');
        console.log('   - admin_test_1_persian_initial.png');
        console.log('   - admin_test_2_english_layout.png'); 
        console.log('   - admin_test_4_*.png (navigation sections)');
        console.log('   - admin_test_5_*.png (blog subsections)');
        console.log('   - admin_test_6_persian_return.png');
        console.log('   - admin_test_7_mobile_*.png');
        console.log('   - admin_test_8_final_desktop.png');
        
        // Final analysis
        console.log('\n📊 Test Results Summary:');
        console.log(`   ✓ Initial Persian RTL: ${htmlDir === 'rtl' ? '✅' : '❌'}`);
        console.log(`   ✓ Switch to English LTR: ${htmlDirAfter === 'ltr' ? '✅' : '❌'}`);
        console.log(`   ✓ Return to Persian RTL: ${htmlDirPersian === 'rtl' ? '✅' : '❌'}`);
        console.log(`   ✓ Sidebar not blocking content: ${!sidebarBlocking.isBlocking ? '✅' : '❌'}`);
        
        return {
            success: true,
            results: {
                initialRTL: htmlDir === 'rtl',
                switchToLTR: htmlDirAfter === 'ltr', 
                returnToRTL: htmlDirPersian === 'rtl',
                sidebarNotBlocking: !sidebarBlocking.isBlocking,
                sidebarAnalysis: sidebarBlocking
            }
        };
        
    } catch (error) {
        console.log(`❌ Test failed with error: ${error.message}`);
        await page.screenshot({ path: 'admin_test_error.png', fullPage: true });
        return { success: false, error: error.message };
    } finally {
        await browser.close();
    }
}

// Run the test
testBilingualAdminPanel().then(result => {
    console.log('\n📋 Final Test Result:', result);
    process.exit(result.success ? 0 : 1);
}).catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
});