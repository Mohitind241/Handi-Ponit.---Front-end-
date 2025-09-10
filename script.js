// ==================== GLOBAL VARIABLES ====================
let cart = JSON.parse(localStorage.getItem("handiPointCart")) || []
let isMenuOpen = false
const currentUser = JSON.parse(localStorage.getItem("handiPointUser")) || null

// ==================== DOM ELEMENTS ====================
const hamburger = document.querySelector(".hamburger")
const mobileMenu = document.querySelector(".mobile-menu")
const cartIcon = document.querySelector(".cart-icon")
const cartValue = document.querySelector(".cart-value")
const newsletterForm = document.querySelector(".newsletter-form form")
const orderButtons = document.querySelectorAll(".order-btn")

// ==================== INITIALIZATION ====================
document.addEventListener("DOMContentLoaded", () => {
  initializeWebsite()
  updateCartDisplay()
  setupEventListeners()
  setupScrollAnimations()
  setupLazyLoading()
})

// ==================== WEBSITE INITIALIZATION ====================
function initializeWebsite() {
  // Add loading animation
  document.body.classList.add("loaded")

  // Initialize cart from localStorage
  updateCartDisplay()

  // Setup intersection observer for animations
  setupScrollAnimations()

  // Add click handlers to menu items
  setupMenuItemHandlers()

  // Setup form validations
  setupFormValidations()

  console.log("Handi Point website initialized successfully!")
}

// ==================== EVENT LISTENERS SETUP ====================
function setupEventListeners() {
  // Mobile menu toggle
  hamburger?.addEventListener("click", toggleMobileMenu)

  // Close mobile menu when clicking outside
  document.addEventListener("click", (e) => {
    if (isMenuOpen && !mobileMenu.contains(e.target) && !hamburger.contains(e.target)) {
      closeMobileMenu()
    }
  })

  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", handleSmoothScroll)
  })

  // Close mobile menu when clicking on links
  document.querySelectorAll(".mobile-menu a").forEach((link) => {
    link.addEventListener("click", closeMobileMenu)
  })

  // Newsletter form submission
  newsletterForm?.addEventListener("submit", handleNewsletterSubmission)

  // Cart icon click
  cartIcon?.addEventListener("click", showCartModal)

  // Order buttons
  orderButtons.forEach((btn) => {
    btn.addEventListener("click", scrollToMenu)
  })

  // Social media links
  setupSocialMediaHandlers()

  // Window resize handler
  window.addEventListener("resize", handleWindowResize)

  // Scroll handler for navbar
  window.addEventListener("scroll", handleNavbarScroll)
}

// ==================== MOBILE MENU FUNCTIONALITY ====================
function toggleMobileMenu(e) {
  e.preventDefault()
  e.stopPropagation()

  if (isMenuOpen) {
    closeMobileMenu()
  } else {
    openMobileMenu()
  }
}

function openMobileMenu() {
  mobileMenu.classList.add("active")
  hamburger.innerHTML = '<i class="fa-solid fa-xmark"></i>'
  document.body.style.overflow = "hidden"
  isMenuOpen = true

  // Add animation to menu items
  const menuItems = mobileMenu.querySelectorAll("li")
  menuItems.forEach((item, index) => {
    item.style.animation = `slideInRight 0.3s ease ${index * 0.1}s forwards`
  })
}

function closeMobileMenu() {
  mobileMenu.classList.remove("active")
  hamburger.innerHTML = '<i class="fa-solid fa-bars-staggered"></i>'
  document.body.style.overflow = ""
  isMenuOpen = false
}

// ==================== SMOOTH SCROLLING ====================
function handleSmoothScroll(e) {
  e.preventDefault()
  const targetId = this.getAttribute("href")
  const target = document.querySelector(targetId)

  if (target) {
    const headerHeight = document.querySelector(".navbar").offsetHeight
    const targetPosition = target.offsetTop - headerHeight

    window.scrollTo({
      top: targetPosition,
      behavior: "smooth",
    })

    // Update active navigation
    updateActiveNavigation(targetId)
  }
}

function scrollToMenu(e) {
  e.preventDefault()
  const menuSection = document.querySelector("#menu")
  if (menuSection) {
    const headerHeight = document.querySelector(".navbar").offsetHeight
    const targetPosition = menuSection.offsetTop - headerHeight

    window.scrollTo({
      top: targetPosition,
      behavior: "smooth",
    })
  }
}

// ==================== NAVIGATION ACTIVE STATE ====================
function updateActiveNavigation(targetId) {
  // Remove active class from all nav links
  document.querySelectorAll(".navlist a, .mobile-menu a").forEach((link) => {
    link.classList.remove("active")
  })

  // Add active class to current link
  document.querySelectorAll(`a[href="${targetId}"]`).forEach((link) => {
    link.classList.add("active")
  })
}

// ==================== NAVBAR SCROLL EFFECT ====================
function handleNavbarScroll() {
  const navbar = document.querySelector(".navbar")
  if (window.scrollY > 100) {
    navbar.classList.add("scrolled")
  } else {
    navbar.classList.remove("scrolled")
  }
}

// ==================== MENU ITEM HANDLERS ====================
function setupMenuItemHandlers() {
  const menuCards = document.querySelectorAll(".menu-card")

  menuCards.forEach((card, index) => {
    // Add click handler for adding to cart
    const addToCartBtn = document.createElement("button")
    addToCartBtn.className = "btn add-to-cart-btn"
    addToCartBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Add to Cart'
    addToCartBtn.style.marginTop = "1rem"
    addToCartBtn.style.width = "100%"

    const menuContent = card.querySelector(".menu-content")
    menuContent.appendChild(addToCartBtn)

    // Get menu item details
    const itemName = card.querySelector("h3").textContent
    const itemPrice = card.querySelector(".price").textContent.replace("₹", "")
    const itemImage = card.querySelector("img").src
    const itemDescription = card.querySelector("p")?.textContent || "Delicious traditional dish"

    addToCartBtn.addEventListener("click", (e) => {
      e.preventDefault()
      addToCart({
        id: index + 1,
        name: itemName,
        price: Number.parseInt(itemPrice),
        image: itemImage,
        description: itemDescription,
        quantity: 1,
      })
    })

    // Add hover effect
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-10px) scale(1.02)"
    })

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0) scale(1)"
    })
  })
}

// ==================== CART FUNCTIONALITY ====================
function addToCart(item) {
  const existingItem = cart.find((cartItem) => cartItem.id === item.id)

  if (existingItem) {
    existingItem.quantity += 1
    showNotification(`${item.name} quantity updated in cart!`, "success")
  } else {
    cart.push(item)
    showNotification(`${item.name} added to cart!`, "success")
  }

  updateCartDisplay()
  saveCartToStorage()
  animateCartIcon()
}

function removeFromCart(itemId) {
  cart = cart.filter((item) => item.id !== itemId)
  updateCartDisplay()
  saveCartToStorage()
  showNotification("Item removed from cart!", "info")
}

function updateCartQuantity(itemId, newQuantity) {
  const item = cart.find((cartItem) => cartItem.id === itemId)
  if (item) {
    if (newQuantity <= 0) {
      removeFromCart(itemId)
    } else {
      item.quantity = newQuantity
      updateCartDisplay()
      saveCartToStorage()
    }
  }
}

function updateCartDisplay() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  if (cartValue) {
    cartValue.textContent = totalItems
    cartValue.style.display = totalItems > 0 ? "block" : "none"
  }
}

function saveCartToStorage() {
  localStorage.setItem("handiPointCart", JSON.stringify(cart))
}

function animateCartIcon() {
  cartIcon.style.animation = "bounce 0.6s ease"
  setTimeout(() => {
    cartIcon.style.animation = ""
  }, 600)
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

// ==================== CART MODAL ====================
function showCartModal(e) {
  e.preventDefault()

  if (cart.length === 0) {
    showNotification("Your cart is empty!", "info")
    return
  }

  const modal = createCartModal()
  document.body.appendChild(modal)
  document.body.style.overflow = "hidden"

  // Animate modal in
  setTimeout(() => {
    modal.classList.add("active")
  }, 10)
}

function createCartModal() {
  const modal = document.createElement("div")
  modal.className = "cart-modal"
  modal.innerHTML = `
        <div class="cart-modal-content">
            <div class="cart-header">
                <h3>Your Order</h3>
                <button class="close-cart-modal">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="cart-items">
                ${cart
                  .map(
                    (item) => `
                    <div class="cart-item" data-id="${item.id}">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="cart-item-details">
                            <h4>${item.name}</h4>
                            <p>₹${item.price}</p>
                        </div>
                        <div class="cart-item-controls">
                            <button class="quantity-btn minus" data-id="${item.id}">-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-btn plus" data-id="${item.id}">+</button>
                        </div>
                        <button class="remove-item" data-id="${item.id}">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                `,
                  )
                  .join("")}
            </div>
            <div class="cart-footer">
                <div class="cart-total">
                    <h3>Total: ₹${getCartTotal()}</h3>
                </div>
                <div class="cart-actions">
                    <button class="btn clear-cart">Clear Cart</button>
                    <button class="btn checkout-btn">Proceed to Checkout</button>
                </div>
            </div>
        </div>
    `

  // Add event listeners
  modal.querySelector(".close-cart-modal").addEventListener("click", closeCartModal)
  modal.querySelector(".clear-cart").addEventListener("click", clearCart)
  modal.querySelector(".checkout-btn").addEventListener("click", proceedToCheckout)

  // Quantity controls
  modal.querySelectorAll(".quantity-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const itemId = Number.parseInt(this.dataset.id)
      const isPlus = this.classList.contains("plus")
      const currentQuantity = cart.find((item) => item.id === itemId).quantity
      const newQuantity = isPlus ? currentQuantity + 1 : currentQuantity - 1

      updateCartQuantity(itemId, newQuantity)

      if (newQuantity > 0) {
        const quantitySpan = this.parentElement.querySelector(".quantity")
        quantitySpan.textContent = newQuantity
        updateCartModalTotal(modal)
      } else {
        this.closest(".cart-item").remove()
        updateCartModalTotal(modal)
      }
    })
  })

  // Remove item buttons
  modal.querySelectorAll(".remove-item").forEach((btn) => {
    btn.addEventListener("click", function () {
      const itemId = Number.parseInt(this.dataset.id)
      removeFromCart(itemId)
      this.closest(".cart-item").remove()
      updateCartModalTotal(modal)

      if (cart.length === 0) {
        closeCartModal()
      }
    })
  })

  // Close modal when clicking outside
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeCartModal()
    }
  })

  return modal
}

function updateCartModalTotal(modal) {
  const totalElement = modal.querySelector(".cart-total h3")
  totalElement.textContent = `Total: ₹${getCartTotal()}`
}

function closeCartModal() {
  const modal = document.querySelector(".cart-modal")
  if (modal) {
    modal.classList.remove("active")
    document.body.style.overflow = ""
    setTimeout(() => {
      modal.remove()
    }, 300)
  }
}

function clearCart() {
  cart = []
  updateCartDisplay()
  saveCartToStorage()
  closeCartModal()
  showNotification("Cart cleared!", "info")
}

function proceedToCheckout() {
  if (cart.length === 0) {
    showNotification("Your cart is empty!", "error")
    return
  }

  closeCartModal()
  showCheckoutModal()
}

// ==================== CHECKOUT FUNCTIONALITY ====================
function showCheckoutModal() {
  const modal = document.createElement("div")
  modal.className = "checkout-modal"
  modal.innerHTML = `
        <div class="checkout-modal-content">
            <div class="checkout-header">
                <h3>Checkout</h3>
                <button class="close-checkout-modal">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <form class="checkout-form">
                <div class="form-group">
                    <label for="customer-name">Full Name *</label>
                    <input type="text" id="customer-name" required>
                </div>
                <div class="form-group">
                    <label for="customer-phone">Phone Number *</label>
                    <input type="tel" id="customer-phone" required>
                </div>
                <div class="form-group">
                    <label for="customer-address">Delivery Address *</label>
                    <textarea id="customer-address" rows="3" required></textarea>
                </div>
                <div class="form-group">
                    <label for="special-instructions">Special Instructions</label>
                    <textarea id="special-instructions" rows="2" placeholder="Any special requests..."></textarea>
                </div>
                <div class="order-summary">
                    <h4>Order Summary</h4>
                    ${cart
                      .map(
                        (item) => `
                        <div class="summary-item">
                            <span>${item.name} x ${item.quantity}</span>
                            <span>₹${item.price * item.quantity}</span>
                        </div>
                    `,
                      )
                      .join("")}
                    <div class="summary-total">
                        <strong>Total: ₹${getCartTotal()}</strong>
                    </div>
                </div>
                <button type="submit" class="btn place-order-btn">Place Order</button>
            </form>
        </div>
    `

  document.body.appendChild(modal)
  document.body.style.overflow = "hidden"

  setTimeout(() => {
    modal.classList.add("active")
  }, 10)

  // Event listeners
  modal.querySelector(".close-checkout-modal").addEventListener("click", closeCheckoutModal)
  modal.querySelector(".checkout-form").addEventListener("submit", handleOrderSubmission)

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeCheckoutModal()
    }
  })
}

function closeCheckoutModal() {
  const modal = document.querySelector(".checkout-modal")
  if (modal) {
    modal.classList.remove("active")
    document.body.style.overflow = ""
    setTimeout(() => {
      modal.remove()
    }, 300)
  }
}

function handleOrderSubmission(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const orderData = {
    customerName: document.getElementById("customer-name").value,
    customerPhone: document.getElementById("customer-phone").value,
    customerAddress: document.getElementById("customer-address").value,
    specialInstructions: document.getElementById("special-instructions").value,
    items: cart,
    total: getCartTotal(),
    orderTime: new Date().toISOString(),
    orderId: "HP" + Date.now(),
  }

  // Simulate order processing
  const submitBtn = e.target.querySelector(".place-order-btn")
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...'
  submitBtn.disabled = true

  setTimeout(() => {
    // Save order to localStorage (in real app, send to server)
    const orders = JSON.parse(localStorage.getItem("handiPointOrders")) || []
    orders.push(orderData)
    localStorage.setItem("handiPointOrders", JSON.stringify(orders))

    // Clear cart
    cart = []
    updateCartDisplay()
    saveCartToStorage()

    closeCheckoutModal()
    showOrderConfirmation(orderData)
  }, 2000)
}

function showOrderConfirmation(orderData) {
  const modal = document.createElement("div")
  modal.className = "confirmation-modal"
  modal.innerHTML = `
        <div class="confirmation-modal-content">
            <div class="confirmation-icon">
                <i class="fa-solid fa-check-circle"></i>
            </div>
            <h3>Order Confirmed!</h3>
            <p>Thank you for your order, ${orderData.customerName}!</p>
            <div class="order-details">
                <p><strong>Order ID:</strong> ${orderData.orderId}</p>
                <p><strong>Total:</strong> ₹${orderData.total}</p>
                <p><strong>Estimated Delivery:</strong> 30-45 minutes</p>
            </div>
            <p>We'll call you at ${orderData.customerPhone} to confirm your order.</p>
            <button class="btn close-confirmation">Continue Shopping</button>
        </div>
    `

  document.body.appendChild(modal)
  document.body.style.overflow = "hidden"

  setTimeout(() => {
    modal.classList.add("active")
  }, 10)

  modal.querySelector(".close-confirmation").addEventListener("click", () => {
    modal.classList.remove("active")
    document.body.style.overflow = ""
    setTimeout(() => {
      modal.remove()
    }, 300)
  })
}

// ==================== NEWSLETTER FUNCTIONALITY ====================
function handleNewsletterSubmission(e) {
  e.preventDefault()

  const emailInput = e.target.querySelector('input[type="email"]')
  const submitBtn = e.target.querySelector('button[type="submit"]')
  const email = emailInput.value.trim()

  if (!email) {
    showNotification("Please enter a valid email address!", "error")
    return
  }

  // Show loading state
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Subscribing...'
  submitBtn.disabled = true

  // Simulate API call
  setTimeout(() => {
    // Save to localStorage (in real app, send to server)
    const subscribers = JSON.parse(localStorage.getItem("handiPointSubscribers")) || []
    if (!subscribers.includes(email)) {
      subscribers.push(email)
      localStorage.setItem("handiPointSubscribers", JSON.stringify(subscribers))
      showNotification("Successfully subscribed to our newsletter!", "success")
      emailInput.value = ""
    } else {
      showNotification("You are already subscribed!", "info")
    }

    // Reset button
    submitBtn.innerHTML = "Subscribe"
    submitBtn.disabled = false
  }, 1500)
}

// ==================== NOTIFICATION SYSTEM ====================
function showNotification(message, type = "info") {
  const notification = document.createElement("div")
  notification.className = `notification notification-${type}`
  notification.innerHTML = `
        <div class="notification-content">
            <i class="fa-solid fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `

  document.body.appendChild(notification)

  // Animate in
  setTimeout(() => {
    notification.classList.add("show")
  }, 10)

  // Auto remove after 5 seconds
  const autoRemove = setTimeout(() => {
    removeNotification(notification)
  }, 5000)

  // Manual close
  notification.querySelector(".notification-close").addEventListener("click", () => {
    clearTimeout(autoRemove)
    removeNotification(notification)
  })
}

function getNotificationIcon(type) {
  const icons = {
    success: "check-circle",
    error: "exclamation-circle",
    warning: "exclamation-triangle",
    info: "info-circle",
  }
  return icons[type] || "info-circle"
}

function removeNotification(notification) {
  notification.classList.remove("show")
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification)
    }
  }, 300)
}

// ==================== SCROLL ANIMATIONS ====================
function setupScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-in")
      }
    })
  }, observerOptions)

  // Observe elements for animation
  const animateElements = document.querySelectorAll(
    ".service-card, .menu-card, .feature-card, .app-content, .newsletter-container",
  )
  animateElements.forEach((el) => {
    observer.observe(el)
  })
}

// ==================== LAZY LOADING ====================
function setupLazyLoading() {
  const images = document.querySelectorAll("img[src]")
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target
        img.classList.add("loaded")
        imageObserver.unobserve(img)
      }
    })
  })

  images.forEach((img) => {
    imageObserver.observe(img)
  })
}

// ==================== SOCIAL MEDIA HANDLERS ====================
function setupSocialMediaHandlers() {
  const socialLinks = document.querySelectorAll(".social-icons")

  socialLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()
      const icon = this.querySelector("i")

      if (icon.classList.contains("fa-facebook")) {
        // window.open("https://facebook.com/handipoint", "_blank")
      } else if (icon.classList.contains("fa-instagram")) {
        // window.open("https://instagram.com/handipoint", "_blank")
      } else if (icon.classList.contains("fa-twitter") || icon.classList.contains("fa-x-twitter")) {
        // window.open("https://twitter.com/handipoint", "_blank")
      } else if (icon.classList.contains("fa-whatsapp")) {
        window.open("https://wa.me/917677854525?text=Hello! I would like to place an order.", "_blank")
      }
    })
  })
}

// ==================== FORM VALIDATIONS ====================
function setupFormValidations() {
  const inputs = document.querySelectorAll("input, textarea")

  inputs.forEach((input) => {
    input.addEventListener("blur", validateField)
    input.addEventListener("input", clearFieldError)
  })
}

function validateField(e) {
  const field = e.target
  const value = field.value.trim()

  // Remove existing error
  clearFieldError(e)

  if (field.hasAttribute("required") && !value) {
    showFieldError(field, "This field is required")
    return false
  }

  if (field.type === "email" && value && !isValidEmail(value)) {
    showFieldError(field, "Please enter a valid email address")
    return false
  }

  if (field.type === "tel" && value && !isValidPhone(value)) {
    showFieldError(field, "Please enter a valid phone number")
    return false
  }

  return true
}

function showFieldError(field, message) {
  field.classList.add("error")

  let errorElement = field.parentNode.querySelector(".field-error")
  if (!errorElement) {
    errorElement = document.createElement("span")
    errorElement.className = "field-error"
    field.parentNode.appendChild(errorElement)
  }

  errorElement.textContent = message
}

function clearFieldError(e) {
  const field = e.target
  field.classList.remove("error")

  const errorElement = field.parentNode.querySelector(".field-error")
  if (errorElement) {
    errorElement.remove()
  }
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function isValidPhone(phone) {
  const phoneRegex = /^[6-9]\d{9}$/
  return phoneRegex.test(phone.replace(/\D/g, ""))
}

// ==================== WINDOW RESIZE HANDLER ====================
function handleWindowResize() {
  // Close mobile menu on desktop
  if (window.innerWidth > 780 && isMenuOpen) {
    closeMobileMenu()
  }
}

// ==================== UTILITY FUNCTIONS ====================
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// ==================== PERFORMANCE OPTIMIZATIONS ====================
// Debounced scroll handler
const debouncedScrollHandler = debounce(handleNavbarScroll, 10)
window.addEventListener("scroll", debouncedScrollHandler)

// Preload critical images
function preloadImages() {
  const criticalImages = [
    "images/Desi Mutton Handi in Clay Pot.png",
    "images/Aromatic Mutton Pulao.png",
    "images/Handi Mutton - The Real Deal.png",
  ]

  criticalImages.forEach((src) => {
    const img = new Image()
    img.src = src
  })
}

// Initialize preloading
preloadImages()

// ==================== SERVICE WORKER REGISTRATION ====================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered: ", registration)
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError)
      })
  })
}

// ==================== ANALYTICS & TRACKING ====================
function trackEvent(eventName, eventData = {}) {
  // In a real application, you would send this to your analytics service
  console.log("Event tracked:", eventName, eventData)

  // Example: Google Analytics 4
  // gtag('event', eventName, eventData);
}

// Track page load
trackEvent("page_view", {
  page_title: document.title,
  page_location: window.location.href,
})

// ==================== ERROR HANDLING ====================
window.addEventListener("error", (e) => {
  console.error("JavaScript error:", e.error)
  // In production, you might want to send this to an error tracking service
})

window.addEventListener("unhandledrejection", (e) => {
  console.error("Unhandled promise rejection:", e.reason)
  // In production, you might want to send this to an error tracking service
})

// ==================== EXPORT FOR TESTING ====================
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    addToCart,
    removeFromCart,
    updateCartQuantity,
    getCartTotal,
    isValidEmail,
    isValidPhone,
  }
}
