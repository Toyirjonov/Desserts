import { desserts } from "./data.js";
import formatNumber from "./formatNumber.js";

let cart = [];

const productList = document.getElementById("products-list");
const template = document.querySelector("template");
const cartTitle = document.querySelector(".menu-right-title");
const cartImage = document.querySelector(".menu-right-image");
const cartDescription = document.querySelector(".menu-right-description");
const menuRight = document.querySelector(".menu-right");

const cartContent = document.createElement("div");
cartContent.className = "cart-content";
cartTitle.insertAdjacentElement("afterend", cartContent);

desserts.forEach((dessert, index) => {
  const clone = template.content.cloneNode(true);
  const { image, type, name, price } = dessert;
  const dessertImage = clone.querySelector(".product-image");
  const dessertType = clone.querySelector(".product-type");
  const dessertName = clone.querySelector(".product-name");
  const dessertPrice = clone.querySelector(".product-price");
  const addToCartBtn = clone.querySelector(".add-to-cart-btn");

  dessertImage.src = image;
  dessertImage.alt = name;
  dessertType.textContent = type;
  dessertName.textContent = name;
  dessertPrice.textContent = formatNumber(price);
  addToCartBtn.setAttribute("data-index", index);

  addToCartBtn.addEventListener("click", (e) => {
    e.preventDefault();
    handleAddToCart(index, addToCartBtn);
  });

  productList.appendChild(clone);
});

function handleAddToCart(index, button) {
  const dessert = desserts[index];
  const existingItem = cart.find((item) => item.index === index);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      index,
      name: dessert.name,
      price: dessert.price,
      quantity: 1,
    });
  }

  const currentItem = cart.find((item) => item.index === index);
  updateButtonState(button, currentItem.quantity, index);
  updateCartDisplay();
}

function updateButtonState(button, quantity, index) {
  const productItem = button.closest(".product-item");

  if (quantity > 0) {
    button.innerHTML = `
      <button class="quantity-btn minus-btn" type="button">
        <img src="./assets/icons/state-delete-default.svg" alt="decrease" width="20" height="20" />
      </button>
      <span class="quantity">${quantity}</span>
      <button class="quantity-btn plus-btn" type="button">
        <img src="./assets/icons/state-add-default.svg" alt="increase" width="20" height="20" />
      </button>
    `;

    button.classList.add("active");
    productItem.classList.add("active");

    const minusBtn = button.querySelector(".minus-btn");
    const plusBtn = button.querySelector(".plus-btn");

    minusBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      updateQuantity(index, -1);
    });

    plusBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      updateQuantity(index, 1);
    });
  } else {
    button.innerHTML = `
      <img src="./assets/icons/add-to-cart.svg" alt="add to cart" width="20" height="20" />
      <span class="btn-title">Add to Cart</span>
    `;

    button.classList.remove("active");
    productItem.classList.remove("active");
  }
}

function updateQuantity(index, change) {
  const itemIndex = cart.findIndex((item) => item.index === index);

  if (itemIndex !== -1) {
    cart[itemIndex].quantity += change;

    if (cart[itemIndex].quantity <= 0) {
      cart.splice(itemIndex, 1);
    }
  }

  const button = document.querySelector(`[data-index="${index}"]`);
  const currentItem = cart.find((item) => item.index === index);
  const quantity = currentItem ? currentItem.quantity : 0;

  updateButtonState(button, quantity, index);
  updateCartDisplay();
}

function removeFromCart(index) {
  cart = cart.filter((item) => item.index !== index);
  const button = document.querySelector(`[data-index="${index}"]`);
  updateButtonState(button, 0, index);
  updateCartDisplay();
}

function updateCartDisplay() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  cartTitle.textContent = `Your Cart (${totalItems})`;

  if (cart.length === 0) {
    showEmptyCart();
  } else {
    showCartWithItems(totalPrice);
  }
}

function showEmptyCart() {
  cartImage.style.display = "block";
  cartDescription.style.display = "block";
  cartContent.innerHTML = "";
}

function showCartWithItems(totalPrice) {
  cartImage.style.display = "none";
  cartDescription.style.display = "none";

  cartContent.innerHTML = `
    <div class="cart-items">
      ${cart.map((item) => createCartItemHTML(item)).join("")}
    </div>
    <div class="cart-total">
      <span>Order Total</span>
      <span class="total-price">${formatNumber(totalPrice)}</span>
    </div>
    <div class="carbon-neutral">
      <img src="./assets/icons/carbon_tree.svg" alt="carbon neutral" width="21" height="20" />
      <p>This is a <strong>carbon-neutral</strong> delivery</p>
    </div>
    <button class="confirm-order-btn" type="button">Confirm Order</button>
  `;

  addRemoveItemListeners();

  const confirmBtn = cartContent.querySelector(".confirm-order-btn");
  confirmBtn.addEventListener("click", handleConfirmOrder);
}

function createCartItemHTML(item) {
  const itemTotal = item.price * item.quantity;

  return `
    <div class="cart-item">
      <div class="cart-item-info">
        <h3 class="cart-item-name">${item.name}</h3>
        <div class="cart-item-details">
          <span class="cart-item-quantity">${item.quantity}x</span>
          <span class="cart-item-price">@ ${formatNumber(item.price)}</span>
          <span class="cart-item-total">${formatNumber(itemTotal)}</span>
        </div>
      </div>
      <button class="remove-item-btn" data-index="${item.index}" type="button">
        <img src="./assets/icons/cancel-default.svg" alt="remove item" width="20" height="20" />
      </button>
    </div>
  `;
}

function addRemoveItemListeners() {
  const removeButtons = cartContent.querySelectorAll(".remove-item-btn");

  removeButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      const index = parseInt(button.getAttribute("data-index"));
      removeFromCart(index);
    });
  });
}

function handleConfirmOrder() {
  showOrderModal();
}

function showOrderModal() {
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const modal = document.createElement("div");
  modal.className = "order-modal-overlay";

  modal.innerHTML = `
    <div class="order-modal">
      <div class="order-header">
        <img src="./assets/icons/state-add-default.svg" alt="confirmed" width="48" height="48" />
        <h2>Order Confirmed</h2>
        <p>We hope you enjoy your food!</p>
      </div>
      
      <div class="order-items">
        ${cart
          .map(
            (item) => `
          <div class="order-item">
            <img src="${desserts[item.index].image}" alt="${
              item.name
            }" class="order-item-image" />
            <div class="order-item-details">
              <h4>${item.name}</h4>
              <div class="order-item-pricing">
                <span class="quantity">${item.quantity}x</span>
                <span class="price">@ ${formatNumber(item.price)}</span>
              </div>
            </div>
            <span class="order-item-total">${formatNumber(
              item.price * item.quantity
            )}</span>
          </div>
        `
          )
          .join("")}
      </div>
      
      <div class="order-total">
        <span>Order Total</span>
        <span class="total-price">${formatNumber(totalPrice)}</span>
      </div>
      
      <button class="start-new-order-btn">Start New Order</button>
    </div>
  `;

  document.body.appendChild(modal);

  const startNewBtn = modal.querySelector(".start-new-order-btn");
  startNewBtn.addEventListener("click", startNewOrder);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

function startNewOrder() {
  cart = [];

  document.querySelectorAll(".product-item").forEach((item) => {
    item.classList.remove("active");
    const button = item.querySelector(".add-to-cart-btn");
    const index = parseInt(button.getAttribute("data-index"));
    updateButtonState(button, 0, index);
  });

  updateCartDisplay();

  document.querySelector(".order-modal-overlay").remove();
}

updateCartDisplay();
