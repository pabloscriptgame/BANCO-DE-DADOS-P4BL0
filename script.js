// script.js - Funcionalidades mantidas, com adição de efeitos natalinos leves (sem emojis, foco em animações CSS já no CSS)

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    mobileToggle.addEventListener('click', function() {
        mainNav.classList.toggle('active');
    });

    // Tab switching for menu
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;

            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));

            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // Cart functionality
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    const cartCount = document.getElementById('cart-count');
    const cartModal = document.getElementById('cart-modal');
    const openCartModal = document.getElementById('open-cart-modal');
    const closeCartModal = document.querySelector('#cart-modal .close-modal');
    const checkoutButton = document.getElementById('checkout-button');
    const clearCartButton = document.getElementById('clear-cart');
    const modalCartItems = document.getElementById('modal-cart-items');
    const modalTotal = document.getElementById('modal-total');

    function updateCartCount() {
        cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    function renderCart() {
        modalCartItems.innerHTML = '';
        let total = 0;

        cart.forEach((item, index) => {
            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item-modal');
            cartItem.innerHTML = `
                <span>${item.name} (x${item.quantity}) - R$ ${(item.price * item.quantity).toFixed(2)}</span>
                <button onclick="removeFromCart(${index})">Remover</button>
            `;
            modalCartItems.appendChild(cartItem);
            total += item.price * item.quantity;
        });

        modalTotal.textContent = `Total: R$ ${total.toFixed(2)}`;
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    window.removeFromCart = function(index) {
        cart.splice(index, 1);
        renderCart();
        updateCartCount();
        showNotification('Item removido do carrinho!', 'success');
    };

    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const item = button.closest('.item');
            const name = item.dataset.name;
            const price = parseFloat(item.dataset.price);

            const existingItem = cart.find(cartItem => cartItem.name === name);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ name, price, quantity: 1 });
            }

            updateCartCount();
            renderCart();
            showNotification('Item adicionado ao carrinho natalino!', 'success');
        });
    });

    openCartModal.addEventListener('click', () => {
        cartModal.style.display = 'flex';
        renderCart();
    });

    closeCartModal.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });

    window.onclick = function(event) {
        if (event.target === cartModal) {
            cartModal.style.display = 'none';
        }
    };

    checkoutButton.addEventListener('click', () => {
        cartModal.style.display = 'none';
        document.getElementById('checkout-modal').style.display = 'flex';
        document.getElementById('checkout-total').textContent = modalTotal.textContent;
    });

    clearCartButton.addEventListener('click', () => {
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
        updateCartCount();
        showNotification('Carrinho limpo para novas compras natalinas!', 'success');
    });

    // Checkout form
    const checkoutForm = document.getElementById('checkout-form');
    const checkoutModal = document.getElementById('checkout-modal');
    const closeCheckoutModal = document.querySelector('#checkout-modal .close-modal');
    const paymentRadios = document.querySelectorAll('input[name="pagamento"]');
    const trocoDiv = document.getElementById('troco-div');
    const pixDetails = document.getElementById('pix-details');
    const couponInput = document.getElementById('coupon-input');
    const couponApplyBtn = document.getElementById('coupon-apply-btn');
    const couponStatus = document.getElementById('coupon-status');
    let discount = 0;

    paymentRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            trocoDiv.style.display = radio.value === 'Dinheiro' ? 'block' : 'none';
            pixDetails.style.display = radio.value === 'PIX' ? 'block' : 'none';
        });
    });

    couponApplyBtn.addEventListener('click', () => {
        const code = couponInput.value.toUpperCase();
        if (code === 'DEGUSTO5') {
            discount = 0.05;
            couponStatus.textContent = 'Cupom aplicado! 5% de desconto natalino.';
            couponStatus.style.color = '#32CD32';
            updateCheckoutTotal();
        } else {
            couponStatus.textContent = 'Cupom inválido.';
            couponStatus.style.color = '#FF4500';
            discount = 0;
        }
    });

    function updateCheckoutTotal() {
        const total = parseFloat(modalTotal.textContent.replace('Total: R$ ', '')) * (1 - discount);
        document.getElementById('checkout-total').textContent = `Total: R$ ${total.toFixed(2)}`;
    }

    checkoutForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        let message = 'Olá! Novo pedido natalino na DêGusto Lanchonete:\n\n';

        cart.forEach(item => {
            message += `${item.name} (x${item.quantity}) - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
        });

        message += `\nSubtotal: ${modalTotal.textContent}\n`;
        if (discount > 0) message += `Desconto (5%): -R$ ${ (parseFloat(modalTotal.textContent.replace('Total: R$ ', '')) * 0.05).toFixed(2) }\n`;
        message += `Total: ${document.getElementById('checkout-total').textContent}\n\n`;

        message += `Nome: ${formData.get('nome-cliente')}\n`;
        message += `Endereço: ${formData.get('rua')}, ${formData.get('numero')} - ${formData.get('bairro')}`;
        if (formData.get('referencia')) message += ` (Ref: ${formData.get('referencia')})`;
        message += `\nPagamento: ${formData.get('pagamento')}`;
        if (formData.get('pagamento') === 'Dinheiro' && formData.get('troco')) message += ` (Troco para R$ ${formData.get('troco')})`;
        message += `\nObservações: ${formData.get('observacoes') || 'Nenhuma'}\n`;

        const whatsappNumber = '5510738419605'; // Substitua pelo número real do WhatsApp
        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappURL, '_blank');

        showNotification('Pedido natalino enviado para o WhatsApp! Aguarde confirmação com alegria.', 'success');
        checkoutForm.reset();
        checkoutModal.style.display = 'none';
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    });

    closeCheckoutModal.addEventListener('click', () => {
        checkoutModal.style.display = 'none';
    });

    window.onclick = function(event) {
        if (event.target === checkoutModal) {
            checkoutModal.style.display = 'none';
        }
    };

    // Help modal
    const helpButton = document.getElementById('help-button');
    const helpModal = document.getElementById('help-modal');
    const closeHelpModal = document.querySelector('#help-modal .close-modal');

    helpButton.addEventListener('click', () => {
        helpModal.style.display = 'flex';
    });

    closeHelpModal.addEventListener('click', () => {
        helpModal.style.display = 'none';
    });

    window.onclick = function(event) {
        if (event.target === helpModal) {
            helpModal.style.display = 'none';
        }
    };

    // PIX copy function
    window.copyPix = function() {
        navigator.clipboard.writeText('10738419605').then(() => {
            showNotification('Chave PIX copiada para suas compras natalinas!', 'success');
        });
    };

    // Notification function
    function showNotification(message, type = '') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'block';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }

    // Initialize
    updateCartCount();
    renderCart();

    // Efeito natalino adicional: Adicionar classe para animação de entrada natalina
    document.body.classList.add('christmas-loaded');
});