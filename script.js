// Versão corrigida e mais robusta do script.js
document.addEventListener('DOMContentLoaded', () => {
    // Inicialização do Carrinho (persistência local)
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeMenu = document.getElementById('close-menu');
    const mobileCartLink = document.getElementById('mobile-cart-link');

    const cartBtn = document.querySelector('.cart-btn');
    const cartModal = document.getElementById('cart-modal');
    const modalOverlay = document.getElementById('modal-overlay');
    const closeModal = document.getElementById('close-modal');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const clearCart = document.getElementById('clear-cart');
    const checkout = document.getElementById('checkout');

    updateCartCount();
    updateCartDisplay();

    // Mobile menu open/close
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.add('active');
            mobileMenu.setAttribute('aria-hidden', 'false');
        });
    }
    if (closeMenu && mobileMenu) {
        closeMenu.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            mobileMenu.setAttribute('aria-hidden', 'true');
        });
    }
    // Close when clicking backdrop of mobile menu
    if (mobileMenu) {
        mobileMenu.addEventListener('click', (e) => {
            if (e.target === mobileMenu) {
                mobileMenu.classList.remove('active');
                mobileMenu.setAttribute('aria-hidden', 'true');
            }
        });
        mobileMenu.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                mobileMenu.setAttribute('aria-hidden', 'true');
            });
        });
    }
    // Mobile "Meu Carrinho" link
    if (mobileCartLink) {
        mobileCartLink.addEventListener('click', (e) => {
            e.preventDefault();
            mobileMenu.classList.remove('active');
            openCartModal();
        });
    }

    // Slider (só roda se existir slides)
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');
    function nextSlide() {
        if (slides.length === 0) return;
        slides.forEach(s => s.classList.remove('active'));
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }
    if (slides.length > 1) {
        setInterval(nextSlide, 5000);
    }

    // Smooth scroll: ignora links que tenham apenas "#" para não quebrar
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Newsletter simples
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Inscrito com sucesso! Receba novidades no seu e-mail.');
            newsletterForm.reset();
        });
    }

    // Abre modal do carrinho
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            openCartModal();
        });
    }
    if (modalOverlay) modalOverlay.addEventListener('click', closeCartModal);
    if (closeModal) closeModal.addEventListener('click', closeCartModal);

    function openCartModal() {
        if (!cartModal) return;
        cartModal.classList.add('active');
        cartModal.setAttribute('aria-hidden', 'false');
        updateCartDisplay();
    }
    function closeCartModal() {
        if (!cartModal) return;
        cartModal.classList.remove('active');
        cartModal.setAttribute('aria-hidden', 'true');
    }

    // Adicionar ao carrinho
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productCard = e.target.closest('.product-card');
            if (!productCard) return;
            const id = productCard.dataset.productId;
            const name = productCard.querySelector('h3') ? productCard.querySelector('h3').textContent : 'Produto';
            const priceText = productCard.querySelector('p') ? productCard.querySelector('p').textContent : 'R$ 0,00';
            const price = parseFloat(priceText.replace('R$','').replace(/\./g,'').replace(',','.')) || 0;
            const sizeEl = productCard.querySelector('.size-select');
            const size = sizeEl ? sizeEl.value : '';
            const qtyEl = productCard.querySelector('.qty-input');
            const quantity = qtyEl ? Math.max(1, parseInt(qtyEl.value) || 1) : 1;

            const itemKey = `${id}-${size}`;

            const existingIndex = cart.findIndex(ci => ci.key === itemKey);
            if (existingIndex > -1) {
                cart[existingIndex].quantity += quantity;
            } else {
                cart.push({ key: itemKey, id, name, price, size, quantity });
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            updateCartDisplay();

            // feedback curto
            alert(`${quantity}x ${name} (Tamanho ${size}) adicionado ao carrinho!`);

            if (qtyEl) qtyEl.value = 1;
        });
    });

    function updateCartCount() {
        const totalItems = cart.reduce((s, it) => s + (it.quantity || 0), 0);
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) cartCount.textContent = totalItems;
    }

    // Atualiza lista do modal sem usar "onclick" inline
    function updateCartDisplay() {
        if (!cartItems || !cartTotal) return;
        cartItems.innerHTML = '';
        let total = 0;
        if (cart.length === 0) {
            cartItems.innerHTML = '<p style="text-align: center; color: #999;">Seu carrinho está vazio.</p>';
        } else {
            cart.forEach((item, index) => {
                const itemTotal = (item.price || 0) * item.quantity;
                total += itemTotal;
                const itemElement = document.createElement('div');
                itemElement.className = 'cart-item';
                itemElement.innerHTML = `
                    <div class="cart-item-info">
                        <strong>${item.name}</strong><br>
                        Tamanho: ${item.size} | R$ ${Number(item.price).toFixed(2)}<br>
                        <small>Subtotal: R$ ${itemTotal.toFixed(2)}</small>
                    </div>
                    <div class="cart-item-controls">
                        <div class="qty-controls" data-index="${index}">
                            <button class="qty-btn qty-decrease" aria-label="Diminuir quantidade">-</button>
                            <span class="qty-value">${item.quantity}</span>
                            <button class="qty-btn qty-increase" aria-label="Aumentar quantidade">+</button>
                        </div>
                        <button class="remove-item remove-btn" data-index="${index}">Remover</button>
                    </div>
                `;
                cartItems.appendChild(itemElement);
            });

            // Attach listeners AFTER elements are in DOM
            cartItems.querySelectorAll('.qty-decrease').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idx = parseInt(e.target.closest('.qty-controls').dataset.index);
                    updateQuantity(idx, -1);
                });
            });
            cartItems.querySelectorAll('.qty-increase').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idx = parseInt(e.target.closest('.qty-controls').dataset.index);
                    updateQuantity(idx, 1);
                });
            });
            cartItems.querySelectorAll('.remove-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idx = parseInt(e.target.dataset.index);
                    removeItem(idx);
                });
            });
        }
        cartTotal.innerHTML = `<strong>Total: R$ ${total.toFixed(2)}</strong>`;
    }

    function updateQuantity(index, change) {
        if (!cart[index]) return;
        const newQty = cart[index].quantity + change;
        if (newQty <= 0) return;
        cart[index].quantity = newQty;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        updateCartDisplay();
    }

    function removeItem(index) {
        if (!cart[index]) return;
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        updateCartDisplay();
        // feedback curto
        alert('Item removido do carrinho!');
    }

    if (clearCart) {
        clearCart.addEventListener('click', () => {
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            updateCartDisplay();
            alert('Carrinho limpo!');
        });
    }

    if (checkout) {
        checkout.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Seu carrinho está vazio!');
                return;
            }
            const total = cart.reduce((s,i) => s + (i.price * i.quantity), 0);
            const itemsList = cart.map(i => `${i.name} (Tamanho ${i.size}) x${i.quantity} - R$ ${(i.price * i.quantity).toFixed(2)}`).join('\n');
            const message = `Olá! Gostaria de finalizar uma compra na Rafaela Oliveira Store.\n\nItens:\n${itemsList}\n\nTotal: R$ ${total.toFixed(2)}\n\nPor favor, confirme o pedido e formas de pagamento/entrega.`;
            const whatsappUrl = `https://wa.me/5534999194464?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
            closeCartModal();
        });
    }

    // Mantém estilo do header ao rolar
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (!header) return;
        if (window.scrollY > 100) header.style.background = 'rgba(255,255,255,0.95)';
        else header.style.background = '#fff';
    });

});