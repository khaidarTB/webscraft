/**
 * Navigation Module
 * Handles smooth scrolling, sticky header, and mobile menu
 */

/**
 * Toggle mobile menu
 */
function toggleMobileMenu() {
    const navMenu = document.getElementById('navMenu');
    const mobileToggle = document.getElementById('mobileToggle');

    if (navMenu && mobileToggle) {
        navMenu.classList.toggle('active');
        mobileToggle.classList.toggle('active');

        // Prevent body scroll when menu is open
        if (navMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }
}

/**
 * Close mobile menu
 */
function closeMobileMenu() {
    const navMenu = document.getElementById('navMenu');
    const mobileToggle = document.getElementById('mobileToggle');

    if (navMenu && mobileToggle) {
        navMenu.classList.remove('active');
        mobileToggle.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/**
 * Smooth scroll to section
 */
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const headerHeight = document.getElementById('header')?.offsetHeight || 80;
        const offsetTop = section.offsetTop - headerHeight;

        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });

        // Close mobile menu if open
        closeMobileMenu();
    }
}

/**
 * Update active navigation link based on scroll position
 */
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const headerHeight = document.getElementById('header')?.offsetHeight || 80;

    let currentSection = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop - headerHeight - 100;
        const sectionHeight = section.offsetHeight;

        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

/**
 * Handle header scroll effect
 */
function handleHeaderScroll() {
    const header = document.getElementById('header');

    if (header) {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
}

/**
 * Add click handlers to navigation links
 */
function initNavLinks() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                const sectionId = href.substring(1);
                scrollToSection(sectionId);
            }
        });
    });

    // Also handle CTA buttons that link to sections
    const ctaLinks = document.querySelectorAll('a[href^="#"]');
    ctaLinks.forEach(link => {
        // Skip if it's already a nav-link
        if (!link.classList.contains('nav-link')) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    const sectionId = href.substring(1);
                    scrollToSection(sectionId);
                }
            });
        }
    });
}

/**
 * Animate elements on scroll (intersection observer)
 */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.card, .info-item, .feature-item');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = `all 0.5s ease-out ${index * 0.05}s`;
        observer.observe(el);
    });
}

/**
 * Initialize navigation
 */
function initNavigation() {
    // Add scroll listener for header effect and active link
    window.addEventListener('scroll', () => {
        handleHeaderScroll();
        updateActiveNavLink();
    }, { passive: true });

    // Initialize nav links
    initNavLinks();

    // Initialize scroll animations
    initScrollAnimations();

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        const navMenu = document.getElementById('navMenu');
        const mobileToggle = document.getElementById('mobileToggle');

        if (navMenu && navMenu.classList.contains('active')) {
            if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
                closeMobileMenu();
            }
        }
    });

    // Handle resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeMobileMenu();
        }
    });

    // Initial calls
    handleHeaderScroll();
    updateActiveNavLink();
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', initNavigation);
