# photography-marketplace
A responsive photography marketplace website designed to showcase and sell nature photographs.
The site allows users to browse, filter and search through nature themed photography, add 
photos to a shopping cart, select print sizes, and complete a simulated checkout process.

This project was created as a front-end web development project with a focus on responsive design,
interactive functionality through JavaScript, and created a realistic online marketplace experience.

## Features

- Responsive photography gallery
- Filter photographs by category and photographer
- Search gallery by name
- Retractable sidebar and cart
- Add and remove photos to and from the cart
- Selectable print sizes
- Dynamic cart count indicator
- Dynamic cart total counter
- Persistent cart using local storage
- Checkout page with a customer information form
- Order summery with selected photos and sizes
- Simulated order confirmation

### Technologies Used
- HTML5
- CSS3
- JavaScript
- LocalStorage
- Google Fonts

### HTML

HTML is used to structure the site's gallery and checkout pages interfaces

### CSS

CSS is used for the site's overall layout and visual design

#JavaScript
JavaScript is used to provide the site its interactive funtionallity, inculiding:
- Dynamic gallery rendering
- Search and filtering
- Shopping cart funtionallity
- Cart size selections
- Price calculation
- Lightbox image viewing
- Checkout form validation
- Order confirmation

### Local Storage

The shopping cart used the browsers local storage to preserve selected photographs when
navigating between the gallery and checkout page

## Project Structure
photography-marketplace/
│
├── assets/
│   ├── animals/
│   ├── plants/
│   ├── landscapes/
│
├── css/
│   ├── gallery.css
│   └── checkout.css
│
├── js/
│   ├── gallery.js
│   ├── photos.js
│   └── checkout.js
│
├── gallery.html
├── checkout.html
└── README.md

## How It Works
### Gallery

The main gallery displays photos dynamically using an array of photo objects stored in photos.js.

Each photo contains information such as:
- Photo ID
- Title
- Photographer
- Category
- Image path

The gallery can be searched and filtered without requiring a page reload.

### Shopping Cart

Users can add photographs directly from the gallery.

Each cart item includes:
- Photograph
- Photographer
- Selected print size
- Price

The cart automatically updates its item count and total when photographs are added, removed, or resized.
The cart is stored using browser localStorage, allowing the selected photographs to remain available when the user moves from the gallery to checkout.

### Checkout

The checkout page displays the user's selected photographs and order total before collecting basic customer information.
The checkout is intentionally simulated for demonstration purposes. No real payment processing, payment API, or financial transaction is performed.
After submitting the form, the site generates a demonstration order number and displays an order confirmation.

### Design

The visual design is inspired by nature photography and uses a muted, natural color palette to keep the photographs as the primary focus.

Typography uses:
- Cormorant Garamond for headings
- Lato for body text and interface elements

The layout is designed to remain usable across desktop, tablet, and mobile screen sizes.

## What I Learned

This project helped me strengthen my understanding of front-end web development and JavaScript-driven user interfaces.

### Responsive Web Design

I gained more experience creating layouts that adapt to different screen sizes. In particular, I worked with Flexbox, responsive sizing, media queries, and retractable sidebars.

### JavaScript and DOM Manipulation

This project gave me more experience using JavaScript to dynamically create and update page content rather than hard-coding every photograph into the HTML.
I also worked with event listeners and DOM manipulation to create interactive features such as filtering, searching, cart updates, and checkout functionality.

### Building an E-Commerce Interface

The project helped me understand how different parts of an e-commerce experience work together. I built a workflow that allows a user to browse products, select options, add items to a cart, review an order, and complete a simulated checkout.

### Local Storage

I learned how browser localStorage can be used to preserve application data between pages. This allowed the shopping cart to remain available when navigating from the gallery to the checkout page.

### User Experience

I spent significant time refining the layout and interaction of the site, including retractable sidebars, search and filtering, larger photography cards, cart controls, and responsive layouts.
This helped me better understand how functionality and visual design need to work together to create a usable interface.

## Future Improvements
- Connecting the site to a backend database
- Adding user accounts
- Adding photographer accounts and photo uploads
- Expanding the photography catalog
- Adding more advanced filtering options
- Improving accessibility
- Adding additional responsive design refinements

## Author
Braeden Carlson
