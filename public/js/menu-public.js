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

document.addEventListener('DOMContentLoaded', () => {
    renderMenu(currentPage);
    renderPagination();
});