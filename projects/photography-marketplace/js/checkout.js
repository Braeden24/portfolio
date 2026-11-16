
const orderItems = document.getElementById("order-items");
const orderTotal = document.getElementById("order-total");
const checkoutForm = document.getElementById("checkout-form");
const checkoutContainer = document.getElementById("checkout-container");
const confirmation = document.getElementById("confirmation");
const orderNumber = document.getElementById("order-number");

const cart = JSON.parse(localStorage.getItem("photoCart")) || [];

function renderOrder() {
    if (cart.length === 0) {
        orderItems.innerHTML = `
            <p class="empty-order">
                Your cart is empty.
                <a href="gallery.html">Return to the gallery</a>
                to select some photographs.
            </p>
        `;

        orderTotal.textContent = "$0.00";
        checkoutForm.querySelector("button[type='submit']").disabled = true;
        return;
    }

    orderItems.innerHTML = cart.map(photo => `
        <article class="order-item">
            <img src="${photo.image}" alt="${photo.title}">

            <div class="order-item-details">
                <h3>${photo.title}</h3>
                <p>${photo.photographer}</p>
                <p>Size: ${photo.size}</p>
            </div>

            <span class="order-item-price">
                $${Number(photo.price).toFixed(2)}
            </span>
        </article>
    `).join("");

    const total = cart.reduce(
        (sum, photo) => sum + Number(photo.price),
        0
    );

    orderTotal.textContent = `$${total.toFixed(2)}`;
}

checkoutForm.addEventListener("submit", event => {
    event.preventDefault();

    if (cart.length === 0) return;

    if (!checkoutForm.reportValidity()) return;

    // Generate a demonstration order number.
    const generatedOrderNumber =
        "PHOTO-" + Math.floor(100000 + Math.random() * 900000);

    orderNumber.textContent = generatedOrderNumber;

    // Hide checkout and display confirmation.
    checkoutContainer.hidden = true;
    confirmation.hidden = false;

    // Clear the saved cart after successful submission.
    localStorage.removeItem("photoCart");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

renderOrder();
