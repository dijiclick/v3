#!/usr/bin/env python3

import asyncio
import time
from playwright.async_api import async_playwright

async def test_bilingual_admin_panel():
    """Test the bilingual admin panel layout functionality"""
    
    async with async_playwright() as p:
        # Launch browser
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = await context.new_page()
        
        print("🚀 Starting bilingual admin panel tests...")
        
        try:
            # Navigate to admin panel
            print("📍 Navigating to admin panel...")
            await page.goto('http://localhost:5000/admin')
            await page.wait_for_load_state('networkidle')
            
            # Check if we need to login
            if await page.locator('[data-testid="admin-password-input"]').is_visible():
                print("🔐 Logging into admin panel...")
                await page.fill('[data-testid="admin-password-input"]', 'admin123')
                await page.click('[data-testid="admin-login-button"]')
                await page.wait_for_load_state('networkidle')
                await asyncio.sleep(2)
            
            # ========== TEST 1: Initial Layout in Persian (RTL) ==========
            print("\n📱 TEST 1: Testing initial layout in Persian (RTL)")
            await page.screenshot(path='admin_test_1_persian_initial.png', full_page=True)
            
            # Check if layout is RTL
            html_dir = await page.evaluate("document.documentElement.dir")
            print(f"   Document direction: {html_dir}")
            
            # Check sidebar visibility and positioning
            sidebar_visible = await page.locator('.fixed.inset-y-0.z-50.w-64').is_visible()
            print(f"   Sidebar visible: {sidebar_visible}")
            
            # Check if main content has proper margin/padding for sidebar
            main_content = page.locator('main')
            main_content_visible = await main_content.is_visible()
            print(f"   Main content visible: {main_content_visible}")
            
            # ========== TEST 2: Language Switching to English ==========
            print("\n🌐 TEST 2: Testing language switch to English")
            
            # Click language switcher
            await page.click('[data-testid="admin-language-switcher"]')
            await asyncio.sleep(1)
            
            # Switch to English
            await page.click('[data-testid="switch-to-english"]')
            await asyncio.sleep(2)
            await page.wait_for_load_state('networkidle')
            
            # Take screenshot after language switch
            await page.screenshot(path='admin_test_2_english_layout.png', full_page=True)
            
            # Check if layout switched to LTR
            html_dir_after = await page.evaluate("document.documentElement.dir")
            print(f"   Document direction after switch: {html_dir_after}")
            
            # ========== TEST 3: Sidebar Functionality in English ==========
            print("\n📱 TEST 3: Testing sidebar functionality in English")
            
            # Test desktop sidebar (should not block content)
            sidebar_blocking = await page.evaluate("""
                const sidebar = document.querySelector('.fixed.inset-y-0.z-50.w-64');
                const main = document.querySelector('main');
                if (!sidebar || !main) return 'Elements not found';
                
                const sidebarRect = sidebar.getBoundingClientRect();
                const mainRect = main.getBoundingClientRect();
                
                // Check if main content has proper left margin
                const computedStyle = window.getComputedStyle(main.parentElement);
                const paddingLeft = parseInt(computedStyle.paddingLeft) || 0;
                const marginLeft = parseInt(computedStyle.marginLeft) || 0;
                
                return {
                    sidebarWidth: sidebarRect.width,
                    mainLeft: mainRect.left,
                    paddingLeft: paddingLeft,
                    marginLeft: marginLeft,
                    isBlocking: mainRect.left < sidebarRect.right
                };
            """)
            print(f"   Sidebar blocking analysis: {sidebar_blocking}")
            
            # ========== TEST 4: Navigation Menu Testing ==========
            print("\n🧭 TEST 4: Testing navigation in both languages")
            
            # Test navigation to different admin sections
            admin_sections = [
                ('[data-testid="admin-nav-dashboard"]', 'Dashboard'),
                ('[data-testid="admin-nav-products"]', 'Products'),
                ('[data-testid="admin-nav-categories"]', 'Categories'),
                ('[data-testid="admin-nav-blog"]', 'Blog'),
                ('[data-testid="admin-nav-pages"]', 'Pages'),
            ]
            
            for selector, section_name in admin_sections:
                print(f"   Testing {section_name} section...")
                try:
                    await page.click(selector)
                    await asyncio.sleep(1)
                    await page.wait_for_load_state('networkidle')
                    
                    # Take screenshot of section
                    await page.screenshot(path=f'admin_test_4_{section_name.lower()}_english.png', full_page=True)
                except Exception as e:
                    print(f"   Error testing {section_name}: {e}")
            
            # ========== TEST 5: Blog Sub-navigation ==========
            print("\n📝 TEST 5: Testing blog sub-navigation")
            
            # Click on blog to expand sub-menu
            await page.click('[data-testid="admin-nav-blog"]')
            await asyncio.sleep(1)
            
            blog_subsections = [
                ('[data-testid="admin-nav-blog-blog dashboard"]', 'Blog Dashboard'),
                ('[data-testid="admin-nav-blog-blog posts"]', 'Blog Posts'),
                ('[data-testid="admin-nav-blog-authors"]', 'Authors'),
                ('[data-testid="admin-nav-blog-categories"]', 'Blog Categories'),
                ('[data-testid="admin-nav-blog-tags"]', 'Tags'),
            ]
            
            for selector, section_name in blog_subsections:
                print(f"   Testing {section_name} subsection...")
                try:
                    await page.click(selector)
                    await asyncio.sleep(1)
                    await page.wait_for_load_state('networkidle')
                    
                    # Take screenshot
                    await page.screenshot(path=f'admin_test_5_{section_name.lower().replace(" ", "_")}_english.png', full_page=True)
                except Exception as e:
                    print(f"   Error testing {section_name}: {e}")
            
            # ========== TEST 6: Switch back to Persian ==========
            print("\n🌐 TEST 6: Testing switch back to Persian")
            
            # Switch back to Persian
            await page.click('[data-testid="admin-language-switcher"]')
            await asyncio.sleep(1)
            await page.click('[data-testid="switch-to-persian"]')
            await asyncio.sleep(2)
            await page.wait_for_load_state('networkidle')
            
            # Take screenshot in Persian
            await page.screenshot(path='admin_test_6_persian_return.png', full_page=True)
            
            # Check RTL again
            html_dir_persian = await page.evaluate("document.documentElement.dir")
            print(f"   Document direction back to Persian: {html_dir_persian}")
            
            # ========== TEST 7: Mobile Responsiveness ==========
            print("\n📱 TEST 7: Testing mobile responsiveness")
            
            # Test mobile viewport in Persian
            await page.set_viewport_size({'width': 375, 'height': 667})
            await asyncio.sleep(2)
            await page.screenshot(path='admin_test_7_mobile_persian.png', full_page=True)
            
            # Test mobile menu button
            mobile_menu_btn = page.locator('[data-testid="open-sidebar"]')
            if await mobile_menu_btn.is_visible():
                print("   Mobile menu button visible - testing mobile sidebar")
                await mobile_menu_btn.click()
                await asyncio.sleep(1)
                await page.screenshot(path='admin_test_7_mobile_sidebar_open.png', full_page=True)
                
                # Close mobile sidebar
                close_btn = page.locator('[data-testid="close-sidebar"]')
                if await close_btn.is_visible():
                    await close_btn.click()
                    await asyncio.sleep(1)
            
            # Switch to English in mobile
            await page.click('[data-testid="admin-language-switcher"]')
            await asyncio.sleep(1)
            await page.click('[data-testid="switch-to-english"]')
            await asyncio.sleep(2)
            await page.screenshot(path='admin_test_7_mobile_english.png', full_page=True)
            
            # ========== TEST 8: Desktop view final verification ==========
            print("\n🖥️ TEST 8: Final desktop verification")
            
            # Return to desktop view
            await page.set_viewport_size({'width': 1920, 'height': 1080})
            await asyncio.sleep(2)
            await page.screenshot(path='admin_test_8_final_desktop.png', full_page=True)
            
            print("\n✅ All tests completed successfully!")
            print("📸 Screenshots saved:")
            print("   - admin_test_1_persian_initial.png")
            print("   - admin_test_2_english_layout.png") 
            print("   - admin_test_4_*.png (navigation sections)")
            print("   - admin_test_5_*.png (blog subsections)")
            print("   - admin_test_6_persian_return.png")
            print("   - admin_test_7_mobile_*.png")
            print("   - admin_test_8_final_desktop.png")
            
            # Final analysis
            print("\n📊 Test Results Summary:")
            print(f"   ✓ Initial Persian RTL: {'✅' if html_dir == 'rtl' else '❌'}")
            print(f"   ✓ Switch to English LTR: {'✅' if html_dir_after == 'ltr' else '❌'}")
            print(f"   ✓ Return to Persian RTL: {'✅' if html_dir_persian == 'rtl' else '❌'}")
            print(f"   ✓ Sidebar not blocking content: {'✅' if not sidebar_blocking.get('isBlocking', True) else '❌'}")
            
        except Exception as e:
            print(f"❌ Test failed with error: {e}")
            await page.screenshot(path='admin_test_error.png', full_page=True)
        
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(test_bilingual_admin_panel())