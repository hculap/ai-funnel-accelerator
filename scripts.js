// Consolidated scripts.js with UTM parameter handling and webhook integration
// Works for both index.html and program.html

// UTM parameter names to track
const UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

// Webhook URL for form submissions
const WEBHOOK_URL = 'https://hook.eu1.make.com/6a32gchxhg1ciwmljood8uiurunk8ulw';

// Cookie utility functions
function setCookie(name, value, days = 30) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
}

// UTM Parameter Handling Functions
function extractUtmParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const utmData = {};
    
    UTM_PARAMS.forEach(param => {
        const value = urlParams.get(param);
        if (value) {
            utmData[param] = value;
        }
    });
    
    return utmData;
}

function storeUtmParams(utmData, days = 30) {
    Object.keys(utmData).forEach(param => {
        setCookie(param, utmData[param], days);
        console.log(`Stored UTM parameter: ${param} = ${utmData[param]}`);
    });
}

function getStoredUtmParams() {
    const utmData = {};
    
    UTM_PARAMS.forEach(param => {
        const value = getCookie(param);
        if (value) {
            utmData[param] = value;
        }
    });
    
    return utmData;
}

function addUtmHiddenInputs(form) {
    if (!form) return;
    
    const utmData = getStoredUtmParams();
    
    // Remove existing UTM hidden inputs to avoid duplicates
    UTM_PARAMS.forEach(param => {
        const existingInput = form.querySelector(`input[name="${param}"]`);
        if (existingInput && existingInput.type === 'hidden') {
            existingInput.remove();
        }
    });
    
    // Add new hidden inputs for each UTM parameter
    Object.keys(utmData).forEach(param => {
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = param;
        hiddenInput.value = utmData[param];
        form.appendChild(hiddenInput);
        console.log(`Added hidden input: ${param} = ${utmData[param]}`);
    });
}

function addUtmInputsToAllForms() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        addUtmHiddenInputs(form);
    });
}

function initUtmTracking() {
    // Extract UTM parameters from current URL
    const currentUtmParams = extractUtmParams();
    
    // If we have UTM parameters in the URL, store them (overwrites existing)
    if (Object.keys(currentUtmParams).length > 0) {
        storeUtmParams(currentUtmParams);
        console.log('New UTM parameters detected and stored:', currentUtmParams);
    }
    
    // Add hidden inputs to existing forms
    addUtmInputsToAllForms();
    
    // Set up a MutationObserver to handle dynamically added forms
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // Check if the added node is a form
                    if (node.tagName === 'FORM') {
                        addUtmHiddenInputs(node);
                    }
                    // Check if the added node contains forms
                    const forms = node.querySelectorAll && node.querySelectorAll('form');
                    if (forms) {
                        forms.forEach(form => addUtmHiddenInputs(form));
                    }
                }
            });
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

function getUtmDataForSubmission() {
    return getStoredUtmParams();
}

function clearUtmParams() {
    UTM_PARAMS.forEach(param => {
        document.cookie = `${param}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
    console.log('All UTM parameters cleared');
}

// Function to send form data to webhook
async function sendFormDataToWebhook(formData, formType = 'unknown') {
    try {
        // Add additional metadata
        const submissionData = {
            ...formData,
            form_type: formType,
            timestamp: new Date().toISOString(),
            page_url: window.location.href,
            page_title: document.title,
            user_agent: navigator.userAgent,
            referrer: document.referrer || 'direct'
        };

        // Debug: Log what we're sending
        console.log('Sending data to webhook:', submissionData);
        
        // Specifically log package info for debugging
        if (submissionData.package) {
            console.log('Package included:', submissionData.package);
        } else {
            console.warn('No package found in submission data!');
        }

        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(submissionData)
        });

        if (response.ok) {
            console.log('Form data sent successfully');
            return { success: true, response };
        } else {
            console.error('Failed to send form data:', response.status, response.statusText);
            return { success: false, error: `Server error: ${response.status}` };
        }
    } catch (error) {
        console.error('Error sending form data:', error);
        return { success: false, error: error.message };
    }
}

// Function to show loading state on button
function setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.dataset.originalText = button.textContent;
        button.textContent = 'Wysyłanie...';
        button.disabled = true;
        button.style.opacity = '0.7';
    } else {
        button.textContent = button.dataset.originalText || button.textContent;
        button.disabled = false;
        button.style.opacity = '1';
    }
}

// Function to show success/error messages
function showMessage(message, isSuccess = true) {
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.textContent = message;
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10001;
        background: ${isSuccess ? '#10b981' : '#ef4444'};
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(messageEl);
    
    // Show message
    setTimeout(() => {
        messageEl.style.transform = 'translateX(0)';
    }, 100);
    
    // Hide and remove message
    setTimeout(() => {
        messageEl.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(messageEl);
        }, 300);
    }, 5000);
}

// Function to auto-fill form from cookies
function autoFillFormFromCookies() {
    // Get data from cookies
    const userName = getCookie('userName') || getCookie('user_name');
    const userEmail = getCookie('userEmail') || getCookie('user_email');
    const userPhone = getCookie('userPhone') || getCookie('user_phone');
    
    // Fill the registration form if data exists
    if (userName || userEmail || userPhone) {
        // Wait for the form to be available
        const fillForm = () => {
            // Registration form fields
            const nameField = document.getElementById('name');
            const emailField = document.getElementById('email');
            const phoneField = document.getElementById('phone');
            
            // Opt-in form fields
            const optinNameField = document.getElementById('optinName');
            const optinEmailField = document.getElementById('optinEmail');
            const optinPhoneField = document.getElementById('optinPhone');
            
            if (nameField && userName) {
                nameField.value = userName;
                nameField.classList.add('has-value');
            }
            
            if (emailField && userEmail) {
                emailField.value = userEmail;
                emailField.classList.add('has-value');
            }
            
            if (phoneField && userPhone) {
                phoneField.value = userPhone;
                phoneField.classList.add('has-value');
            }
            
            if (optinNameField && userName) {
                optinNameField.value = userName;
                optinNameField.classList.add('has-value');
            }
            
            if (optinEmailField && userEmail) {
                optinEmailField.value = userEmail;
                optinEmailField.classList.add('has-value');
            }
            
            if (optinPhoneField && userPhone) {
                optinPhoneField.value = userPhone;
                optinPhoneField.classList.add('has-value');
            }
            
            console.log('Form auto-filled from cookies:', { userName, userEmail, userPhone });
        };
        
        // Try to fill immediately, then with a small delay if form isn't ready
        fillForm();
        setTimeout(fillForm, 100);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize UTM tracking FIRST
    initUtmTracking();
    
    // Initialize Three.js background
    initThreeJsBackground();
    
    // Reveal animations on scroll
    initScrollReveal();
    
    // Sticky header (only if it exists)
    initStickyHeader();
    
    // Form input effects
    initFormEffects();
    
    // Countdown timer (only if countdown elements exist)
    initCountdown();

    // Checkbox animation
    initCheckboxAnimation();

    // FAQ Accordion (only if FAQ elements exist)
    initFaqAccordion();

    // Modal functionality - program registration modal
    if (document.getElementById('registrationModal')) {
        initModalFunctionality();
    }

    // Initialize Video Players
    initVideoPlayers();
    
    // Auto-fill form on page load
    autoFillFormFromCookies();

    // Initialize opt-in functionality if on index page
    if (document.getElementById('optinModal')) {
        initOptinModalFunctionality();
    }
    
    // Initialize tilt effects (if on desktop)
    initTiltEffects();
    
    // Initialize pulse animations
    initPulseAnimations();
});

// Three.js animated background
function initThreeJsBackground() {
    const container = document.getElementById('scene-container');
    if (!container) return;
    
    // Scene, camera, and renderer setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    
    // Create particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1500;
    
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 15;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    // Material
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.02,
        color: 0x6366f1,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    
    // Mesh
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    
    // Position camera
    camera.position.z = 5;
    
    // Mouse move effect
    let mouseX = 0;
    let mouseY = 0;
    
    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) - 0.5;
        mouseY = (event.clientY / window.innerHeight) - 0.5;
    });
    
    // Handle resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // Animation
    const animate = () => {
        requestAnimationFrame(animate);
        
        particlesMesh.rotation.x += 0.0003;
        particlesMesh.rotation.y += 0.0003;
        
        // Follow mouse with slight delay
        particlesMesh.rotation.x += mouseY * 0.001;
        particlesMesh.rotation.y += mouseX * 0.001;
        
        renderer.render(scene, camera);
    };
    
    animate();
}

// Scroll reveal animations
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    const fadeElements = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('reveal-on-scroll')) {
                    entry.target.classList.add('reveal-visible');
                }
                if (entry.target.classList.contains('fade-in-up') ||
                    entry.target.classList.contains('fade-in-left') ||
                    entry.target.classList.contains('fade-in-right')) {
                    setTimeout(() => {
                        entry.target.classList.add('in-view');
                    }, 100);
                }
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -100px 0px'
    });
    
    revealElements.forEach(element => {
        observer.observe(element);
    });
    
    fadeElements.forEach(element => {
        observer.observe(element);
    });
}

// Sticky header behavior
function initStickyHeader() {
    const nav = document.querySelector('.sticky-nav');
    if (!nav) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('nav-scrolled');
        } else {
            nav.classList.remove('nav-scrolled');
        }
    });
}

// Form input animations and validation
function initFormEffects() {
    const formInputs = document.querySelectorAll('.form-input');
    
    formInputs.forEach(input => {
        // Focus effect
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('input-focused');
        });
        
        input.addEventListener('blur', () => {
            input.parentElement.classList.remove('input-focused');
            
            // Simple validation
            if (input.value.trim() !== '') {
                input.classList.add('has-value');
            } else {
                input.classList.remove('has-value');
            }
        });
        
        // Check if input already has value on page load
        if (input.value.trim() !== '') {
            input.classList.add('has-value');
        }
    });
}

// Initialize FAQ accordion functionality
function initFaqAccordion() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    if (faqQuestions.length === 0) return; // Exit if no FAQ elements
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            const answer = question.nextElementSibling;
            const icon = question.querySelector('.faq-icon');
            const isOpen = question.getAttribute('aria-expanded') === 'true';
            
            // Close all other FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                if (item !== faqItem) {
                    const itemQuestion = item.querySelector('.faq-question');
                    const itemAnswer = item.querySelector('.faq-answer');
                    const itemIcon = item.querySelector('.faq-icon');
                    
                    itemQuestion.setAttribute('aria-expanded', 'false');
                    itemAnswer.style.maxHeight = '0';
                    itemAnswer.classList.add('hidden');
                    itemIcon.style.transform = 'rotate(0deg)';
                }
            });
            
            // Toggle current FAQ item
            if (isOpen) {
                question.setAttribute('aria-expanded', 'false');
                answer.style.maxHeight = '0';
                setTimeout(() => {
                    answer.classList.add('hidden');
                }, 300);
                icon.style.transform = 'rotate(0deg)';
            } else {
                question.setAttribute('aria-expanded', 'true');
                answer.classList.remove('hidden');
                answer.style.maxHeight = answer.scrollHeight + 'px';
                icon.style.transform = 'rotate(180deg)';
            }
        });
    });
}

// Countdown timer
function initCountdown() {
    const countdownElements = document.querySelectorAll('.countdown-number');
    if (countdownElements.length === 0) return; // Exit if no countdown elements
    
    // Target date: June 15th, 2025 at 23:59:59
    const targetDate = new Date('2025-06-15T23:59:59').getTime();
    
    // Calculate the total duration from now to target for progress bar
    const startDate = new Date().getTime();
    const totalDuration = targetDate - startDate;

    const countdownInterval = setInterval(() => {
        const now = new Date().getTime();
        const timeRemaining = targetDate - now;

        if (timeRemaining > 0) {
            // Calculate time units
            const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

            // Update display
            const daysElements = document.querySelectorAll('.countdown-number');
            if (daysElements.length >= 4) {
                daysElements[0].textContent = days.toString().padStart(2, '0');
                daysElements[1].textContent = hours.toString().padStart(2, '0');
                daysElements[2].textContent = minutes.toString().padStart(2, '0');
                daysElements[3].textContent = seconds.toString().padStart(2, '0');
            }
        } else {
            // Countdown expired
            clearInterval(countdownInterval);
            document.querySelectorAll('.countdown-container').forEach(container => {
                container.innerHTML = '<div class="expired text-center text-2xl font-bold text-gradient">🎉 Czas upłynął! 🎉</div>';
            });
        }
    }, 1000);

    // Initial call to avoid delay
    const now = new Date().getTime();
    const timeRemaining = targetDate - now;
    
    if (timeRemaining > 0) {
        const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

        const daysElements = document.querySelectorAll('.countdown-number');
        if (daysElements.length >= 4) {
            daysElements[0].textContent = days.toString().padStart(2, '0');
            daysElements[1].textContent = hours.toString().padStart(2, '0');
            daysElements[2].textContent = minutes.toString().padStart(2, '0');
            daysElements[3].textContent = seconds.toString().padStart(2, '0');
        }
    }
}

// Checkbox animation
function initCheckboxAnimation() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const checkmark = this.parentElement.querySelector('svg');
            if (this.checked) {
                this.parentElement.parentElement.classList.add('checked');
                checkmark.classList.remove('hidden');
            } else {
                this.parentElement.parentElement.classList.remove('checked');
                checkmark.classList.add('hidden');
            }
        });
    });
}

// Modal functionality for registration (program.html) - UPDATED WITH WEBHOOK INTEGRATION
function initModalFunctionality() {
    const modal = document.getElementById('registrationModal');
    const form = document.getElementById('registrationForm');
    
    if (!form) return; // Exit if form doesn't exist
    
    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitButton = form.querySelector('button[type="submit"]');
        setButtonLoading(submitButton, true);
        
        try {
            // Get form data - including all fields and hidden inputs
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            // Debug: Log all captured form data
            console.log('Raw FormData entries:');
            for (let [key, value] of formData.entries()) {
                console.log(`  ${key}: ${value}`);
            }
            console.log('Converted to object:', data);
            
            // Validate required fields
            const requiredFields = ['name', 'email', 'phone'];
            const missingFields = requiredFields.filter(field => !data[field] || data[field].trim() === '');
            
            if (missingFields.length > 0) {
                console.error('Missing required fields:', missingFields);
                showMessage(`Proszę wypełnić wszystkie wymagane pola: ${missingFields.join(', ')}`, false);
                return;
            }
            
            // Extra validation for package selection
            const packageSelect = document.getElementById('package');
            if (packageSelect) {
                if (packageSelect.value) {
                    data.package = packageSelect.value;
                    console.log('Package captured from select:', data.package);
                } else {
                    console.warn('No package selected');
                    showMessage('Proszę wybrać pakiet przed wysłaniem formularza.', false);
                    return;
                }
            }
            
            // Add UTM data to submission
            const utmData = getUtmDataForSubmission();
            const submissionData = { ...data, ...utmData };
            
            console.log('Final submission data:', submissionData); // Debug log
            
            // Send to webhook
            const result = await sendFormDataToWebhook(submissionData, 'program_registration');
            
            if (result.success) {
                // Store user data in cookies for future use
                setCookie('userName', data.name || '', 30);
                setCookie('userEmail', data.email || '', 30);
                setCookie('userPhone', data.phone || '', 30);
                
                showMessage('Dziękujemy za zgłoszenie! Nasz doradca skontaktuje się z Tobą wkrótce.', true);
                
                // Close modal and reset form
                closeModal();
                
                // Reset form but preserve package selection for next time
                const selectedPackage = data.package;
                form.reset();
                if (selectedPackage && packageSelect) {
                    packageSelect.value = selectedPackage;
                }
                
                // Optional: redirect to thank you page after delay
                // setTimeout(() => {
                //     window.location.href = '/dziekujemy.html';
                // }, 2000);
                
            } else {
                showMessage('Wystąpił błąd podczas wysyłania formularza. Spróbuj ponownie.', false);
            }
            
        } catch (error) {
            console.error('Form submission error:', error);
            showMessage('Wystąpił błąd podczas wysyłania formularza. Spróbuj ponownie.', false);
        } finally {
            setButtonLoading(submitButton, false);
        }
    });
    
    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeModal();
        }
    });
    
    // Add package select change handler
    const packageSelect = document.getElementById('package');
    if (packageSelect) {
        packageSelect.addEventListener('change', function() {
            this.classList.add('has-value');
            console.log('Package changed to:', this.value); // Debug log
        });
    }
}

// Modal functionality for opt-in (index.html) - UPDATED WITH WEBHOOK INTEGRATION
function initOptinModalFunctionality() {
    const modal = document.getElementById('optinModal');
    const form = document.getElementById('optinForm');
    
    if (!form) return; // Exit if form doesn't exist
    
    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitButton = form.querySelector('button[type="submit"]');
        setButtonLoading(submitButton, true);
        
        try {
            // Get form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            // Add UTM data to submission
            const utmData = getUtmDataForSubmission();
            const submissionData = { ...data, ...utmData };
            
            // Send to webhook
            const result = await sendFormDataToWebhook(submissionData, 'lead_optin');
            
            if (result.success) {
                // Store user data in cookies for future use
                setCookie('userName', data.optinName || '', 30);
                setCookie('userEmail', data.optinEmail || '', 30);
                setCookie('userPhone', data.optinPhone || '', 30);
                
                showMessage('Dziękujemy! Zaraz zobaczysz wideo z szkoleniem.', true);
                
                // Close modal
                closeOptinModal();
                
                // Redirect to program page after a short delay
                setTimeout(() => {
                    window.location.href = '/program.html';
                }, 1500);
                
            } else {
                showMessage('Wystąpił błąd podczas wysyłania formularza. Spróbuj ponownie.', false);
            }
            
        } catch (error) {
            console.error('Opt-in form submission error:', error);
            showMessage('Wystąpił błąd podczas wysyłania formularza. Spróbuj ponownie.', false);
        } finally {
            setButtonLoading(submitButton, false);
        }
    });
    
    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeOptinModal();
            }
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeOptinModal();
        }
    });
}

// Video Player Functionality
function initVideoPlayers() {
    // Get all video players
    const videoPlayers = document.querySelectorAll('.custom-video-player');
    
    videoPlayers.forEach(player => {
        const video = player.querySelector('video');
        const playOverlay = player.querySelector('.play-overlay');
        const playButtonLarge = player.querySelector('.play-button-large');
        const controls = player.querySelector('.video-controls');
        const playPauseBtn = player.querySelector('.play-pause');
        const volumeBtn = player.querySelector('.volume-btn');
        const fullscreenBtn = player.querySelector('.fullscreen-btn');
        const progressBar = player.querySelector('.progress-bar');
        const progressFilled = player.querySelector('.progress-filled');
        const progressHandle = player.querySelector('.progress-handle');
        const currentTimeEl = player.querySelector('[id*="currentTime"]');
        const durationEl = player.querySelector('[id*="duration"]');
        
        if (!video) return;
        
        let isDragging = false;
        let controlsTimeout;
        let lastTime = 0;
        
        // Format time function
        function formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        }
        
        // Update progress bar
        function updateProgress() {
            if (!isDragging && video.duration) {
                const percentage = (video.currentTime / video.duration) * 100;
                progressFilled.style.width = `${percentage}%`;
                progressHandle.style.left = `${percentage}%`;
                
                if (currentTimeEl) {
                    currentTimeEl.textContent = formatTime(video.currentTime);
                }
            }
        }
        
        // Toggle play/pause
        function togglePlayPause() {
            if (video.paused) {
                video.play();
            } else {
                video.pause();
            }
        }
        
        // Toggle mute
        function toggleMute() {
            video.muted = !video.muted;
            updateVolumeIcon();
        }
        
        // Update volume icon
        function updateVolumeIcon() {
            const volumeUp = volumeBtn.querySelector('.volume-up');
            const volumeMuted = volumeBtn.querySelector('.volume-muted');
            
            if (video.muted || video.volume === 0) {
                volumeUp.classList.add('hidden');
                volumeMuted.classList.remove('hidden');
            } else {
                volumeUp.classList.remove('hidden');
                volumeMuted.classList.add('hidden');
            }
        }
        
        // Update play/pause icon
        function updatePlayPauseIcon() {
            const playIcon = playPauseBtn.querySelector('.play-icon');
            const pauseIcon = playPauseBtn.querySelector('.pause-icon');
            
            if (video.paused) {
                playIcon.classList.remove('hidden');
                pauseIcon.classList.add('hidden');
                player.classList.remove('video-playing');
            } else {
                playIcon.classList.add('hidden');
                pauseIcon.classList.remove('hidden');
                player.classList.add('video-playing');
            }
        }
        
        // Update fullscreen icon
        function updateFullscreenIcon() {
            const openIcon = fullscreenBtn.querySelector('.fullscreen-open');
            const closeIcon = fullscreenBtn.querySelector('.fullscreen-close');
            
            if (document.fullscreenElement || 
                document.webkitFullscreenElement || 
                document.mozFullScreenElement) {
                openIcon.classList.add('hidden');
                closeIcon.classList.remove('hidden');
            } else {
                openIcon.classList.remove('hidden');
                closeIcon.classList.add('hidden');
            }
        }
        
        // Toggle fullscreen
        function toggleFullscreen() {
            if (document.fullscreenElement || 
                document.webkitFullscreenElement || 
                document.mozFullScreenElement) {
                // Exit fullscreen
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                }
            } else {
                // Enter fullscreen
                if (player.requestFullscreen) {
                    player.requestFullscreen();
                } else if (player.webkitRequestFullscreen) {
                    player.webkitRequestFullscreen();
                } else if (player.mozRequestFullScreen) {
                    player.mozRequestFullScreen();
                }
            }
        }
        
        // Show/hide controls
        function showControls() {
            if (controls) {
                controls.classList.add('show');
                clearTimeout(controlsTimeout);
                
                if (!video.paused) {
                    controlsTimeout = setTimeout(() => {
                        controls.classList.remove('show');
                    }, 3000);
                }
            }
        }
        
        // Handle progress bar click/drag
        function handleProgressInteraction(e) {
            const rect = progressBar.getBoundingClientRect();
            const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const newTime = percentage * video.duration;
            
            if (video.duration) {
                video.currentTime = newTime;
                progressFilled.style.width = `${percentage * 100}%`;
                progressHandle.style.left = `${percentage * 100}%`;
            }
        }
        
        // Event listeners
        video.addEventListener('loadedmetadata', () => {
            if (durationEl) {
                durationEl.textContent = formatTime(video.duration);
            }
        });
        
        video.addEventListener('timeupdate', updateProgress);
        video.addEventListener('play', updatePlayPauseIcon);
        video.addEventListener('pause', updatePlayPauseIcon);
        video.addEventListener('volumechange', updateVolumeIcon);
        
        // Large play button
        if (playButtonLarge) {
            playButtonLarge.addEventListener('click', togglePlayPause);
        }
        
        // Control buttons
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', togglePlayPause);
        }
        
        if (volumeBtn) {
            volumeBtn.addEventListener('click', toggleMute);
        }
        
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', toggleFullscreen);
        }
        
        // Progress bar interactions
        if (progressBar) {
            progressBar.addEventListener('click', handleProgressInteraction);
            
            // Progress handle dragging
            let startX = 0;
            let startLeft = 0;
            
            progressHandle.addEventListener('mousedown', (e) => {
                isDragging = true;
                progressHandle.classList.add('dragging');
                startX = e.clientX;
                startLeft = progressHandle.offsetLeft;
                e.preventDefault();
            });
            
            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                
                const rect = progressBar.getBoundingClientRect();
                const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                
                progressFilled.style.width = `${percentage * 100}%`;
                progressHandle.style.left = `${percentage * 100}%`;
                
                if (video.duration) {
                    video.currentTime = percentage * video.duration;
                }
            });
            
            document.addEventListener('mouseup', () => {
                if (isDragging) {
                    isDragging = false;
                    progressHandle.classList.remove('dragging');
                }
            });
            
            // Touch events for mobile
            progressHandle.addEventListener('touchstart', (e) => {
                isDragging = true;
                progressHandle.classList.add('dragging');
                e.preventDefault();
            });
            
            document.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                
                const touch = e.touches[0];
                const rect = progressBar.getBoundingClientRect();
                const percentage = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
                
                progressFilled.style.width = `${percentage * 100}%`;
                progressHandle.style.left = `${percentage * 100}%`;
                
                if (video.duration) {
                    video.currentTime = percentage * video.duration;
                }
                e.preventDefault();
            });
            
            document.addEventListener('touchend', () => {
                if (isDragging) {
                    isDragging = false;
                    progressHandle.classList.remove('dragging');
                }
            });
        }
        
        // Player interactions
        player.addEventListener('click', (e) => {
            // Don't toggle play/pause if clicking on controls
            if (!e.target.closest('.video-controls') && !e.target.closest('.play-overlay')) {
                togglePlayPause();
            }
        });
        
        player.addEventListener('mousemove', showControls);
        player.addEventListener('mouseenter', showControls);
        player.addEventListener('mouseleave', () => {
            if (!video.paused) {
                setTimeout(() => {
                    if (controls) {
                        controls.classList.remove('show');
                    }
                }, 1000);
            }
        });
        
        // Keyboard controls
        video.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    togglePlayPause();
                    break;
                case 'KeyM':
                    toggleMute();
                    break;
                case 'KeyF':
                    toggleFullscreen();
                    break;
                case 'ArrowLeft':
                    video.currentTime = Math.max(0, video.currentTime - 10);
                    break;
                case 'ArrowRight':
                    video.currentTime = Math.min(video.duration, video.currentTime + 10);
                    break;
            }
        });
        
        // Fullscreen change events
        document.addEventListener('fullscreenchange', updateFullscreenIcon);
        document.addEventListener('webkitfullscreenchange', updateFullscreenIcon);
        document.addEventListener('mozfullscreenchange', updateFullscreenIcon);
        
        // Double-click to fullscreen
        video.addEventListener('dblclick', toggleFullscreen);
        
        // Initialize icons
        updatePlayPauseIcon();
        updateVolumeIcon();
        updateFullscreenIcon();
        
        // Set video to be focusable for keyboard controls
        video.setAttribute('tabindex', '0');
    });
}

// Global modal functions - UPDATED WITH AUTO-FILL AND UTM
function openModal(selectedPackage = null) {
    const modal = document.getElementById('registrationModal');
    const packageSelect = document.getElementById('package');
    const form = document.getElementById('registrationForm');
    
    if (!modal) return;
    
    // Set selected package if provided
    if (selectedPackage && packageSelect) {
        packageSelect.value = selectedPackage;
        packageSelect.classList.add('has-value'); // Add visual indicator
        console.log('Package selected:', selectedPackage); // Debug log
    }

    // Show modal
    modal.classList.remove('hidden');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Add UTM inputs to the form
    if (form) {
        addUtmHiddenInputs(form);
    }
    
    // Auto-fill form from cookies
    autoFillFormFromCookies();
    
    // Focus on first empty input
    setTimeout(() => {
        const inputs = modal.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]');
        for (let input of inputs) {
            if (!input.value) {
                input.focus();
                break;
            }
        }
        // If all inputs are filled, focus on the submit button
        if (Array.from(inputs).every(input => input.value)) {
            const submitBtn = modal.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.focus();
        }
    }, 300);
}

function closeModal() {
    const modal = document.getElementById('registrationModal');
    
    if (!modal) return;
    
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    
    // Hide modal after animation
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

// Global opt-in modal functions
function openOptinModal() {
    const modal = document.getElementById('optinModal');
    const form = document.getElementById('optinForm');
    
    if (!modal) return;
    
    // Show modal
    modal.classList.remove('hidden');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Add UTM inputs to the form
    if (form) {
        addUtmHiddenInputs(form);
    }
    
    // Auto-fill form from cookies
    autoFillFormFromCookies();
    
    // Focus on first empty input
    setTimeout(() => {
        const inputs = modal.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]');
        for (let input of inputs) {
            if (!input.value) {
                input.focus();
                break;
            }
        }
    }, 300);
}

function closeOptinModal() {
    const modal = document.getElementById('optinModal');
    
    if (!modal) return;
    
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    
    // Hide modal after animation
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80, // Offset for the sticky header
                behavior: 'smooth'
            });
        }
    });
});

// Initialize 3D Tilt Effects (for desktop only)
function initTiltEffects() {
    // Only apply tilt effects on desktop devices
    if (window.innerWidth > 1024) {
        const tiltCards = document.querySelectorAll('.tilt-card');
        
        tiltCards.forEach(card => {
            const cardInner = card.querySelector('.tilt-card-inner');
            if (!cardInner) return;
            
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / centerY * -10;
                const rotateY = (x - centerX) / centerX * 10;
                
                cardInner.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });
            
            card.addEventListener('mouseleave', () => {
                cardInner.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
            });
        });
    }
}

// Utility function to detect page type
function getPageType() {
    const path = window.location.pathname;
    if (path.includes('program.html') || path === '/program.html') {
        return 'program';
    } else if (path.includes('index.html') || path === '/' || path === '/index.html') {
        return 'index';
    }
    return 'unknown';
}

// Pulse animation for CTA buttons
function initPulseAnimations() {
    const pulseButtons = document.querySelectorAll('.pulse-btn');
    
    pulseButtons.forEach(button => {
        // Add CSS animation class if not already present
        if (!button.style.animation) {
            button.style.animation = 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite';
        }
    });
}