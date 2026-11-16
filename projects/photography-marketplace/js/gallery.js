const gallery = document.getElementById("photo-gallery");
const searchInput = document.getElementById("photo-search");
const resultsCount = document.getElementById("results-count");
const emptyMessage = document.getElementById("empty-message");

const marketplace = document.getElementById("marketplace");

const filterToggle = document.getElementById("filter-toggle");
const cartToggle = document.getElementById("cart-toggle");

const lightbox = document.getElementById("photo-lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxClose = document.getElementById("lightbox-close");

const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartCount = document.getElementById("cart-count");

const categoryFilters = document.querySelectorAll('input[name="category"]');
const photographerFilters = document.querySelectorAll('input[name="photographer"]');

const checkoutButton = document.getElementById("checkout-button");

let cart = JSON.parse(localStorage.getItem("photoCart")) || [];

function saveCart() {
    localStorage.setItem("photoCart", JSON.stringify(cart));
}

const photoPrices = {
    small: 10,
    medium: 20,
    large: 35
};

function getSelectedValue(filters) {
    const selected = Array.from(filters).find(filter => filter.checked);
    return selected ? selected.value : "all";
}


function renderGallery() {

    const selectedCategory = getSelectedValue(categoryFilters);
    const selectedPhotographer = getSelectedValue(photographerFilters);

    const searchTerm = searchInput.value.trim().toLowerCase();

    const filteredPhotos = photos.filter(photo => {

        const matchesCategory =
            selectedCategory === "all" ||
            photo.category === selectedCategory;

        const matchesPhotographer =
            selectedPhotographer === "all" ||
            photo.photographer === selectedPhotographer;

        const matchesSearch =
            photo.title.toLowerCase().includes(searchTerm) ||
            photo.photographer.toLowerCase().includes(searchTerm) ||
            photo.category.toLowerCase().includes(searchTerm);

        return (
            matchesCategory &&
            matchesPhotographer &&
            matchesSearch
        );
    });


    gallery.innerHTML = filteredPhotos.map(photo => {

        const alreadyInCart = cart.some(
            item => item.id === photo.id
        );

        return `
            <article class="photo-card">

                <div
                    class="photo-preview"
                    data-photo-id="${photo.id}"
                    tabindex="0"
                    role="button"
                >
                    <img
                        src="${photo.image}"
                        alt="${photo.title}"
                    >
                </div>

                <div class="photo-info">

                    <h3>${photo.title}</h3>
					<p>${photo.photographer}</p>
					<p>Starting at $${photoPrices.small.toFixed(2)}</p>


                    <button
                        type="button"
                        class="add-to-cart"
                        data-photo-id="${photo.id}"
                        ${alreadyInCart ? "disabled" : ""}
                    >
                        ${alreadyInCart ? "In Cart" : "Add to Cart"}
                    </button>

                </div>

            </article>
        `;
    }).join("");


    resultsCount.textContent =
        `${filteredPhotos.length} photographs`;

    emptyMessage.hidden =
        filteredPhotos.length > 0;
}


function renderCart() {

	cartCount.textContent = cart.length;
    if (cart.length === 0) {

        cartItems.innerHTML = `
            <p class="cart-empty">
                Your cart is empty.
            </p>
        `;

        cartTotal.textContent = "$0.00";
        return;
    }

    cartItems.innerHTML = cart.map(photo => {

        return `
            <div class="cart-item">

                <img
                    src="${photo.image}"
                    alt="${photo.title}"
                >

                <div class="cart-item-info">

                    <h3>${photo.title}</h3>

                    <p>${photo.photographer}</p>

                    <label for="size-${photo.id}">
                        Print Size:
                    </label>

                    <select
                        class="cart-size"
                        id="size-${photo.id}"
                        data-photo-id="${photo.id}"
                    >
                        <option value="small"
							${photo.size === "small" ? "selected" : ""}>
							Small
						</option>

						<option value="medium"
							${photo.size === "medium" ? "selected" : ""}>
							Medium
						</option>

						<option value="large"
							${photo.size === "large" ? "selected" : ""}>
							Large
					</option>
                    </select>

                    <p class="cart-item-price">
                        $${photo.price.toFixed(2)}
                    </p>

                    <button
                        type="button"
                        class="remove-from-cart"
                        data-photo-id="${photo.id}"
                    >
                        Remove
                    </button>

                </div>

            </div>
        `;
    }).join("");

    const total = cart.reduce(
        (sum, photo) => sum + photo.price,
        0
    );

    cartTotal.textContent = `$${total.toFixed(2)}`;
}


cartItems.addEventListener("change", event => {

    if (!event.target.classList.contains("cart-size")) {
        return;
    }

    const photoId = event.target.dataset.photoId;
    const selectedSize = event.target.value;

    const photo = cart.find(
        item => item.id === photoId
    );

    if (!photo) return;

    photo.size = selectedSize;
    photo.price = photoPrices[selectedSize];

    renderCart();
	saveCart();
});



gallery.addEventListener("click", event => {

    const button = event.target.closest(".add-to-cart");

    if (button) {

        const photoId = button.dataset.photoId;

        const photo = photos.find(
            photo => photo.id === photoId
        );

        if (!photo) return;

        // Prevent duplicate items
        if (cart.some(item => item.id === photoId)) {
            return;
        }

        cart.push({...photo,
			size: "small",
			price: photoPrices.small
		});

        renderCart();
        renderGallery();
		saveCart();
		
        return;
    }
	
//LIGHTBOX FUNCTIONS
	//Open Lightbox
    const preview = event.target.closest(".photo-preview");

    if (preview) {

        const photoId = preview.dataset.photoId;

        const photo = photos.find(
            photo => photo.id === photoId
        );

        if (!photo) return;

        lightboxImage.src = photo.image;
        lightboxImage.alt = photo.title;

        lightbox.classList.add("active");

        lightbox.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.style.overflow = "hidden";
    }
});

//Close Lightbox
function closeLightbox() {

    lightbox.classList.remove("active");

    lightbox.setAttribute(
        "aria-hidden",
        "true"
    );

    lightboxImage.src = "";

    document.body.style.overflow = "";
}


lightboxClose.addEventListener(
    "click",
    closeLightbox
);


lightbox.addEventListener("click", event => {

    if (event.target === lightbox) {
        closeLightbox();
    }
});


document.addEventListener("keydown", event => {
    if (
        event.key === "Escape" &&
        lightbox.classList.contains("active")
    ) {
        closeLightbox();
    }
});

cartItems.addEventListener("click", event => {

    const button = event.target.closest(
        ".remove-from-cart"
    );

    if (!button) return;

    const photoId = button.dataset.photoId;

    cart = cart.filter(
        item => item.id !== photoId
    );

    renderCart();
    renderGallery();
	saveCart();
	
});

categoryFilters.forEach(filter => {
    filter.addEventListener(
        "change",
        renderGallery
    );
});


photographerFilters.forEach(filter => {
    filter.addEventListener(
        "change",
        renderGallery
    );
});

searchInput.addEventListener(
    "input",
    renderGallery
);

const clearFiltersButton =
    document.getElementById("clear-filters");

if (clearFiltersButton) {
    clearFiltersButton.addEventListener(
        "click",
        () => {
            categoryFilters.forEach(filter => {
                filter.checked =
                    filter.value === "all";
            });
            photographerFilters.forEach(filter => {
                filter.checked =
                    filter.value === "all";
            });
            searchInput.value = "";
            renderGallery();
        }
    );
}

filterToggle.addEventListener("click", () => {

    marketplace.classList.toggle(
        "sidebar-collapsed"
    );
});

cartToggle.addEventListener("click", () => {
    marketplace.classList.toggle(
        "cart-collapsed"
    );
});

checkoutButton.addEventListener("click", () => {
    if (cart.length === 0) {
        return;
    }

    saveCart();
    window.location.href = "checkout.html";
});

renderGallery();
renderCart();
