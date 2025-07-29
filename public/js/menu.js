const menuData = [
    { name: "Gyoza 煎餃", category: "snacks", image: "/images/ossu-p1.PNG", price: "P268" },
    { name: "Suigyouza 水餃", category: "snacks", image: "/images/ossu-p2.PNG", price: "P228" },
    { name: "Seafood fried 蚵仔、蝦仁煎", category: "snacks", image: "/images/ossu-p3.PNG", price: "P288" },
    { name: "Taiwan Sausage (3pcs)", category: "snacks", image: "/images/ossu-p4.PNG", price: "P368" },
    { name: "Hong-Ma 控肉", category: "snacks", image: "/images/ossu-p5.PNG", price: "P388" },
    { name: "TanTan Noodle", category: "meals", image: "/images/ossu-r1.PNG", price: "P308" },
    { name: "Taiwan Sha-te fried Noodles", category: "meals", image: "/images/ossu-r2.PNG", price: "P419" },
    { name: "Dry Noodle 特製乾麵", category: "meals", image: "/images/ossu-r3.PNG", price: "P258" },
    { name: "Pork katsu Curry 豬排咖哩", category: "meals", image: "/images/ossu-k1.PNG", price: "P318" },
    { name: "Chicken katsu Curry 雞排咖哩", category: "meals", image: "/images/ossu-k2.PNG", price: "P308" },
    { name: "Ebi Tempura Curry 炸蝦咖哩", category: "meals", image: "/images/ossu-k3.PNG", price: "P318" },
    { name: "Tori Karaage Curry 鹽酥雞咖哩", category: "meals", image: "/images/ossu-k4.PNG", price: "P308" },
    { name: "OSSU Ice Tea", category: "drinks", image: "/images/ossu-drink1.PNG", price: "P110" },
    { name: "Strawberry Jasmine Tea", category: "drinks", image: "/images/ossu-drink2.jpg", price: "P110" },
    { name: "Lychee balck Tea", category: "drinks", image: "/images/ossu-drink3.jpg", price: "P110" },
    { name: "Mango Shake", category: "drinks", image: "/images/ossu-drink4.jpg", price: "$7.99" },
    { name: "Taiwan Milk Tea", category: "drinks", image: "/images/ossu-drink5.jpg", price: "$7.99" },
    { name: "Sesamei ball 芝麻球", category: "desserts", image: "/images/ossu-de1.PNG", price: "P188" },
    { name: "Herbal Jelly 龜苓膏", category: "desserts", image: "/images/ossu-de2.PNG", price: "P140" },
    { name: "Fried buns 炸饅頭", category: "desserts", image: "/images/ossu-de3.PNG", price: "P218" },
    { name: "Radish cake 港式蘿蔔糕", category: "desserts", image: "/images/ossu-de4.PNG", price: "P188" },
    { name: "Spring roll 春捲(素食)", category: "desserts", image: "/images/ossu-de5.PNG", price: "P168" },
    // Add more menu items here
];

const itemsPerPage = 9;
let currentPage = 1;
let currentCategory = 'all';

let cart = [];
updateCart();

function renderMenu(pageNumber) {
    const menuContainer = document.getElementById('menu');
    menuContainer.innerHTML = '';

    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = pageNumber * itemsPerPage;

    const filteredData = getFilteredData();

    for (let i = startIndex; i < endIndex && i < filteredData.length; i++) {
        const item = filteredData[i];
        const menuItem = document.createElement('div');
        menuItem.classList.add('menu-item');

        const image = document.createElement('img');
        image.src = item.image;
        menuItem.appendChild(image);

        const itemName = document.createElement('h2');
        itemName.textContent = item.name;
        menuItem.appendChild(itemName);

        const itemPrice = document.createElement('p');
        itemPrice.textContent = `Price: ${item.price}`;
        menuItem.appendChild(itemPrice);

        const quantityInput = document.createElement('input');
        quantityInput.type = 'number';
        quantityInput.min = '0';
        quantityInput.value = '0';
        quantityInput.classList.add('quantity-input');
        menuItem.appendChild(quantityInput);

        const addToCartButton = document.createElement('button');
        addToCartButton.textContent = 'Add to Cart';
        addToCartButton.addEventListener('click', () => {
            const quantity = parseInt(quantityInput.value, 10);
            addToCart(item, quantity);
        });
        menuItem.appendChild(addToCartButton);

        menuContainer.appendChild(menuItem);
    }
}

function renderPagination() {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    const totalPages = Math.ceil(getFilteredData().length / itemsPerPage);

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => {
            currentPage = i;
            renderMenu(currentPage);
        });
        paginationContainer.appendChild(pageButton);
    }
}

function filterCategory(category) {
    currentCategory = category;
    currentPage = 1;
    renderMenu(currentPage);
    renderPagination();
}

function getFilteredData() {
    return menuData.filter(item => currentCategory === 'all' || item.category === currentCategory);
}

// Modify the addToCart function to include a remove button
function addToCart(item, quantity) {
    if (quantity > 0) {
        const existingItem = cart.find(cartItem => cartItem.name === item.name);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ ...item, quantity });
        }

        updateCart();
    }
}

function updateCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = '';

    let totalPrice = 0;
    const orderItems = [];

    cart.forEach(item => {
        const cartItemElement = document.createElement('div');
        cartItemElement.classList.add('cart-item');
        cartItemElement.setAttribute("name", "orderItems[]");

        const image = document.createElement('img');
        image.src = item.image;
        cartItemElement.appendChild(image);

        const itemName = document.createElement('span');
        itemName.textContent = item.name;
        itemName.className = "food";
        itemName.setAttribute("name", "food");
        cartItemElement.appendChild(itemName);

        const itemQuantity = document.createElement('span');
        itemQuantity.textContent = `x ${item.quantity}`;
        itemQuantity.className = "quantity";
        itemQuantity.setAttribute("name", "quantity");
        cartItemElement.appendChild(itemQuantity);

        const itemPrice = document.createElement('span');
        const price = parseFloat(item.price.substring(1));
        itemPrice.textContent = `= P${(price * item.quantity).toFixed(2)}`;
        itemPrice.className = "price";
        itemPrice.setAttribute("name", "price");
        cartItemElement.appendChild(itemPrice);

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', () => {
        removeFromCart(item.name);
        });
        cartItemElement.appendChild(removeButton);

        cartItemsContainer.appendChild(cartItemElement);

        totalPrice += price * item.quantity;

        // Add the order item data to the orderItems array
        orderItems.push({
            food: item.name,
            quantity: Number(item.quantity),
            price: Number((price * item.quantity).toFixed(2))
        });
    });

    // Update the orderItems input field with the stringified orderItems array
    const orderItemsInput = document.getElementById('CartInput');
    orderItemsInput.setAttribute("value", `${JSON.stringify(orderItems)}`);

    const totalPriceElement = document.getElementById('total-price');
    totalPriceElement.setAttribute("value", `${totalPrice.toFixed(2)}`);
}

// Function to submit the order
async function submitOrder(event) {
    const orderType = document.querySelector('input[name="orderType"]:checked');
    const payment = document.querySelector('input[name="paymentOption"]:checked');

    if (!orderType) {
        alert('Please select Dine-in or Takeout.');
        return;
    }

    if (!payment) {
        alert('Please select Over the Counter or Credit Card.');
        return;
    }

    if (cart.length === 0) {
        alert('Your cart is empty. Add items to your cart before placing an order.');
        return;
    }

    const confirmation = confirm('Are you sure you want to place this order?');

    if (confirmation) {
        alert('Order placed successfully! Thank you for your purchase.');
    } else {
        // Prevent form submission if the user does not confirm
        event.preventDefault();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderMenu(currentPage);
    renderPagination();
});

// Add a new function to remove an item from the cart
function removeFromCart(itemName) {
    cart = cart.filter(item => item.name !== itemName);
    updateCart();
}