document.addEventListener('DOMContentLoaded', function() {
    // Initialize Three.js background
    initThreeJsBackground();
    
    // Reveal animations on scroll
    initScrollReveal();
    
    // Sticky header
    initStickyHeader();
    
    // Form input effects
    initFormEffects();
    
    // Countdown timer
    initCountdown();

    // Checkbox animation
    initCheckboxAnimation();

    // FAQ Accordion
    initFaqAccordion();

    // Modal functionality
    initModalFunctionality();

    // Initialize Video Players
    initVideoPlayers();
});

// Three.js animated background
function initThreeJsBackground() {
    const container = document.getElementById('scene-container');
    
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

// Modal functionality
function initModalFunctionality() {
    const modal = document.getElementById('registrationModal');
    const form = document.getElementById('registrationForm');
    
    // Form submission
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            // Here you would typically send data to your server
            console.log('Form data:', data);
            
            // Show success message (you can customize this)
            alert('Dziękujemy za zgłoszenie! Nasz doradca skontaktuje się z Tobą wkrótce.');
            
            // Close modal and reset form
            closeModal();
            form.reset();
        });
    }
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
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
            controls.classList.add('show');
            clearTimeout(controlsTimeout);
            
            if (!video.paused) {
                controlsTimeout = setTimeout(() => {
                    controls.classList.remove('show');
                }, 3000);
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
                    controls.classList.remove('show');
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

// Global modal functions
function openModal(selectedPackage = null) {
    const modal = document.getElementById('registrationModal');
    const packageSelect = document.getElementById('package');
    
    // Set selected package if provided
    if (selectedPackage && packageSelect) {
        packageSelect.value = selectedPackage;
    }
    
    // Show modal
    modal.classList.remove('hidden');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus on first input
    const firstInput = modal.querySelector('input');
    if (firstInput) {
        setTimeout(() => firstInput.focus(), 300);
    }
}

function closeModal() {
    const modal = document.getElementById('registrationModal');
    
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