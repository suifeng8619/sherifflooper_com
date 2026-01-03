/**
 * Sheriff Looper - Website JavaScript
 * Handles fullscreen modes, mobile detection, and interactions
 */

(function() {
    'use strict';

    // =========================================
    // CONFIGURATION
    // =========================================
    const CONFIG = {
        mobileBreakpoint: 768,
        loadingMinTime: 300, // Reduced for faster loading
        animationDuration: 200
    };

    // =========================================
    // DOM ELEMENTS
    // =========================================
    const elements = {
        // Loading
        loadingScreen: document.getElementById('loading-screen'),
        mainContainer: document.getElementById('main-container'),

        // Game
        gameWrapper: document.getElementById('game-wrapper'),
        gameContainer: document.getElementById('game-container'),
        gameIframe: document.getElementById('game-iframe'),
        gameOverlay: document.getElementById('game-overlay'),
        playButton: document.getElementById('play-button'),

        // Controls
        theaterBtn: document.getElementById('theater-btn'),
        fullscreenBtn: document.getElementById('fullscreen-btn'),
        soundBtn: document.getElementById('sound-btn'),
        helpBtn: document.getElementById('help-btn'),
        theaterExitBtn: document.getElementById('theater-exit-btn'),

        // Modal
        helpModal: document.getElementById('help-modal'),
        modalClose: document.getElementById('modal-close'),

        // Floating Controls
        floatingControls: document.getElementById('floating-controls'),

        // Mobile
        mobilePage: document.getElementById('mobile-page'),
        copyLinkBtn: document.getElementById('copy-link-btn'),
        shareBtn: document.getElementById('share-btn'),

        // Navigation
        navLinks: document.querySelectorAll('.nav-link')
    };

    // =========================================
    // STATE
    // =========================================
    const state = {
        isTheaterMode: false,
        isFullscreen: false,
        isSoundOn: true,
        isMobile: false,
        isLoaded: false
    };

    // =========================================
    // UTILITY FUNCTIONS
    // =========================================

    /**
     * Detect if device is mobile
     */
    function detectMobile() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
        const isSmallScreen = window.innerWidth <= CONFIG.mobileBreakpoint;
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        return mobileRegex.test(userAgent.toLowerCase()) || (isSmallScreen && isTouchDevice);
    }

    /**
     * Add class to element
     */
    function addClass(element, className) {
        if (element) element.classList.add(className);
    }

    /**
     * Remove class from element
     */
    function removeClass(element, className) {
        if (element) element.classList.remove(className);
    }

    /**
     * Toggle class on element
     */
    function toggleClass(element, className) {
        if (element) element.classList.toggle(className);
    }

    /**
     * Show toast notification
     */
    function showToast(message, duration = 2000) {
        // Remove existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) existingToast.remove();

        // Create toast
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(35, 30, 25, 0.95);
            border: 2px solid #E8A849;
            padding: 12px 24px;
            font-family: 'Press Start 2P', cursive;
            font-size: 10px;
            color: #E8A849;
            z-index: 9999;
            animation: toastIn 0.3s ease;
        `;

        document.body.appendChild(toast);

        // Remove after duration
        setTimeout(() => {
            toast.style.animation = 'toastOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    // Add toast animations to head
    const toastStyles = document.createElement('style');
    toastStyles.textContent = `
        @keyframes toastIn {
            from { opacity: 0; transform: translateX(-50%) translateY(20px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes toastOut {
            from { opacity: 1; transform: translateX(-50%) translateY(0); }
            to { opacity: 0; transform: translateX(-50%) translateY(20px); }
        }
    `;
    document.head.appendChild(toastStyles);

    // =========================================
    // LOADING SCREEN
    // =========================================

    function initLoading() {
        const startTime = Date.now();

        window.addEventListener('load', () => {
            const elapsed = Date.now() - startTime;
            const remainingTime = Math.max(0, CONFIG.loadingMinTime - elapsed);

            setTimeout(() => {
                addClass(elements.loadingScreen, 'fade-out');
                removeClass(elements.mainContainer, 'hidden');

                setTimeout(() => {
                    elements.loadingScreen.style.display = 'none';
                    state.isLoaded = true;
                }, 500);
            }, remainingTime);
        });
    }

    // =========================================
    // MOBILE DETECTION & REDIRECT
    // =========================================

    function initMobileDetection() {
        state.isMobile = detectMobile();

        if (state.isMobile) {
            showMobilePage();
        }

        // Handle resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const wasMobile = state.isMobile;
                state.isMobile = detectMobile();

                if (state.isMobile && !wasMobile) {
                    showMobilePage();
                } else if (!state.isMobile && wasMobile) {
                    hideMobilePage();
                }
            }, 250);
        });
    }

    function showMobilePage() {
        removeClass(elements.mobilePage, 'hidden');
        addClass(elements.mainContainer, 'hidden');
        addClass(elements.loadingScreen, 'hidden');
        document.body.style.overflow = 'auto';
    }

    function hideMobilePage() {
        addClass(elements.mobilePage, 'hidden');
        removeClass(elements.mainContainer, 'hidden');
    }

    // =========================================
    // GAME CONTROLS
    // =========================================

    /**
     * Initialize play button overlay
     */
    function initPlayButton() {
        if (elements.playButton) {
            elements.playButton.addEventListener('click', () => {
                addClass(elements.gameOverlay, 'hidden');

                // Focus iframe for keyboard input
                if (elements.gameIframe) {
                    elements.gameIframe.focus();
                }
            });
        }

        // Also hide overlay when clicking on it
        if (elements.gameOverlay) {
            elements.gameOverlay.addEventListener('click', (e) => {
                if (e.target === elements.gameOverlay) {
                    addClass(elements.gameOverlay, 'hidden');
                    if (elements.gameIframe) {
                        elements.gameIframe.focus();
                    }
                }
            });
        }
    }

    /**
     * Toggle Theater Mode (webpage fullscreen)
     */
    function toggleTheaterMode() {
        state.isTheaterMode = !state.isTheaterMode;

        if (state.isTheaterMode) {
            addClass(elements.gameWrapper, 'theater-mode');
            removeClass(elements.theaterExitBtn, 'hidden');
            addClass(elements.theaterBtn, 'active');
            document.body.style.overflow = 'hidden';
            // Hide floating controls
            if (elements.floatingControls) {
                addClass(elements.floatingControls, 'hidden');
            }
            showToast('Theater Mode - Press ESC or T to exit');
        } else {
            removeClass(elements.gameWrapper, 'theater-mode');
            addClass(elements.theaterExitBtn, 'hidden');
            removeClass(elements.theaterBtn, 'active');
            document.body.style.overflow = '';
            // Show floating controls
            if (elements.floatingControls) {
                removeClass(elements.floatingControls, 'hidden');
            }
        }

        // Focus game
        if (elements.gameIframe) {
            elements.gameIframe.focus();
        }
    }

    /**
     * Toggle Browser Fullscreen
     */
    function toggleFullscreen() {
        if (!document.fullscreenElement &&
            !document.webkitFullscreenElement &&
            !document.mozFullScreenElement) {

            // Enter fullscreen
            const container = elements.gameContainer;

            if (container.requestFullscreen) {
                container.requestFullscreen();
            } else if (container.webkitRequestFullscreen) {
                container.webkitRequestFullscreen();
            } else if (container.mozRequestFullScreen) {
                container.mozRequestFullScreen();
            } else if (container.msRequestFullscreen) {
                container.msRequestFullscreen();
            }

            addClass(elements.fullscreenBtn, 'active');
            state.isFullscreen = true;
            showToast('Fullscreen - Press ESC or F to exit');
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }

            removeClass(elements.fullscreenBtn, 'active');
            state.isFullscreen = false;
        }
    }

    /**
     * Handle fullscreen change event
     */
    function handleFullscreenChange() {
        if (!document.fullscreenElement &&
            !document.webkitFullscreenElement &&
            !document.mozFullScreenElement) {
            removeClass(elements.fullscreenBtn, 'active');
            state.isFullscreen = false;
        }
    }

    /**
     * Toggle Sound
     */
    function toggleSound() {
        state.isSoundOn = !state.isSoundOn;

        const icon = elements.soundBtn.querySelector('.btn-icon');
        const text = elements.soundBtn.querySelector('.btn-text');

        if (state.isSoundOn) {
            icon.textContent = '🔊';
            text.textContent = 'SOUND';
            removeClass(elements.soundBtn, 'active');
            showToast('Sound ON');
        } else {
            icon.textContent = '🔇';
            text.textContent = 'MUTED';
            addClass(elements.soundBtn, 'active');
            showToast('Sound OFF');
        }

        // Note: Actually muting the iframe audio would require postMessage
        // communication with the game, which may not be supported
    }

    /**
     * Initialize game controls
     */
    function initGameControls() {
        // Theater mode
        if (elements.theaterBtn) {
            elements.theaterBtn.addEventListener('click', toggleTheaterMode);
        }

        if (elements.theaterExitBtn) {
            elements.theaterExitBtn.addEventListener('click', toggleTheaterMode);
        }

        // Fullscreen
        if (elements.fullscreenBtn) {
            elements.fullscreenBtn.addEventListener('click', toggleFullscreen);
        }

        // Listen for fullscreen changes
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);

        // Sound toggle
        if (elements.soundBtn) {
            elements.soundBtn.addEventListener('click', toggleSound);
        }

        // Help button
        if (elements.helpBtn) {
            elements.helpBtn.addEventListener('click', () => {
                removeClass(elements.helpModal, 'hidden');
            });
        }
    }

    // =========================================
    // MODAL
    // =========================================

    function initModal() {
        // Close button
        if (elements.modalClose) {
            elements.modalClose.addEventListener('click', () => {
                addClass(elements.helpModal, 'hidden');
            });
        }

        // Click backdrop to close
        if (elements.helpModal) {
            elements.helpModal.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal-backdrop')) {
                    addClass(elements.helpModal, 'hidden');
                }
            });
        }
    }

    // =========================================
    // KEYBOARD SHORTCUTS
    // =========================================

    function initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger if typing in input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            switch (e.key.toLowerCase()) {
                case 'f':
                    if (!e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                        toggleFullscreen();
                    }
                    break;

                case 't':
                    if (!e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                        toggleTheaterMode();
                    }
                    break;

                case 'm':
                    if (!e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                        toggleSound();
                    }
                    break;

                case 'escape':
                    // Exit theater mode
                    if (state.isTheaterMode) {
                        toggleTheaterMode();
                    }
                    // Close modal
                    if (!elements.helpModal.classList.contains('hidden')) {
                        addClass(elements.helpModal, 'hidden');
                    }
                    break;
            }
        });
    }

    // =========================================
    // NAVIGATION
    // =========================================

    function initNavigation() {
        // Active state for nav links
        const sections = document.querySelectorAll('section[id]');

        function updateActiveNav() {
            const scrollPos = window.scrollY + 150;

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');

                if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                    elements.navLinks.forEach(link => {
                        removeClass(link, 'active');
                        if (link.getAttribute('href') === '#' + sectionId) {
                            addClass(link, 'active');
                        }
                    });
                }
            });
        }

        window.addEventListener('scroll', updateActiveNav);
        updateActiveNav();

        // Smooth scroll for nav links
        elements.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        // Exit theater mode if active
                        if (state.isTheaterMode) {
                            toggleTheaterMode();
                        }

                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });
    }

    // =========================================
    // MOBILE PAGE ACTIONS
    // =========================================

    /**
     * Update copy button state safely
     */
    function updateCopyButtonState(button, isCopied) {
        const iconSpan = button.querySelector('span');
        if (isCopied) {
            iconSpan.textContent = '✓';
            // Update the text node after the span
            const textNode = button.childNodes[button.childNodes.length - 1];
            if (textNode && textNode.nodeType === Node.TEXT_NODE) {
                textNode.textContent = ' Copied!';
            }
        } else {
            iconSpan.textContent = '📋';
            const textNode = button.childNodes[button.childNodes.length - 1];
            if (textNode && textNode.nodeType === Node.TEXT_NODE) {
                textNode.textContent = ' Copy Link';
            }
        }
    }

    function initMobileActions() {
        // Copy link
        if (elements.copyLinkBtn) {
            elements.copyLinkBtn.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(window.location.href);
                    showToast('Link copied!');
                    updateCopyButtonState(elements.copyLinkBtn, true);
                    setTimeout(() => {
                        updateCopyButtonState(elements.copyLinkBtn, false);
                    }, 2000);
                } catch (err) {
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = window.location.href;
                    textArea.style.position = 'fixed';
                    textArea.style.left = '-9999px';
                    document.body.appendChild(textArea);
                    textArea.select();
                    try {
                        document.execCommand('copy');
                        showToast('Link copied!');
                    } catch (copyErr) {
                        showToast('Could not copy link');
                    }
                    document.body.removeChild(textArea);
                }
            });
        }

        // Share button
        if (elements.shareBtn) {
            elements.shareBtn.addEventListener('click', async () => {
                if (navigator.share) {
                    try {
                        await navigator.share({
                            title: 'Sheriff Looper - Western Horror Adventure',
                            text: 'Check out Sheriff Looper - A Western horror action-adventure pixel game!',
                            url: window.location.href
                        });
                    } catch (err) {
                        if (err.name !== 'AbortError') {
                            showToast('Could not share');
                        }
                    }
                } else {
                    // Fallback: copy link
                    elements.copyLinkBtn.click();
                }
            });
        }
    }

    // =========================================
    // WALKTHROUGH ACCORDION
    // =========================================

    function initAccordion() {
        const accordionItems = document.querySelectorAll('.walkthrough-item');

        accordionItems.forEach(item => {
            item.addEventListener('toggle', () => {
                // Update expand icon
                const icon = item.querySelector('.expand-icon');
                if (icon) {
                    icon.textContent = item.open ? '−' : '+';
                }
            });
        });
    }

    // =========================================
    // PERFORMANCE OPTIMIZATIONS
    // =========================================

    function initPerformance() {
        // Lazy load iframe
        if (elements.gameIframe) {
            // The iframe is already set to load, but we can add loading="lazy" support
            elements.gameIframe.setAttribute('loading', 'lazy');
        }

        // Preconnect to itch.io
        const preconnect = document.createElement('link');
        preconnect.rel = 'preconnect';
        preconnect.href = 'https://itch.io';
        document.head.appendChild(preconnect);

        // DNS prefetch
        const dnsPrefetch = document.createElement('link');
        dnsPrefetch.rel = 'dns-prefetch';
        dnsPrefetch.href = 'https://itch.io';
        document.head.appendChild(dnsPrefetch);
    }

    // =========================================
    // iOS-SPECIFIC HANDLING
    // =========================================

    function initIOSHandling() {
        // Detect iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

        if (isIOS) {
            // iOS doesn't support standard Fullscreen API
            // Update fullscreen button to indicate limitation
            if (elements.fullscreenBtn) {
                elements.fullscreenBtn.setAttribute('title', 'Fullscreen (limited on iOS)');
            }

            // Add iOS class for specific styling
            document.body.classList.add('is-ios');
        }
    }

    // =========================================
    // INITIALIZATION
    // =========================================

    function init() {
        initLoading();
        initMobileDetection();
        initPlayButton();
        initGameControls();
        initModal();
        initKeyboardShortcuts();
        initNavigation();
        initMobileActions();
        initAccordion();
        initPerformance();
        initIOSHandling();

        console.log('Sheriff Looper website initialized!');
    }

    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
