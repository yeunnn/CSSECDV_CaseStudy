// Add event listeners for buttons
document.querySelectorAll('.prepare-btn').forEach(function(button, index) {
    button.addEventListener('click', function() {
        updateOrderStatus(index, 'Preparing');
    });
});

document.querySelectorAll('.serve-btn').forEach(function(button, index) {
    button.addEventListener('click', function() {
        updateOrderStatus(index, 'Served');
    });
});

document.querySelectorAll('.delete-btn').forEach(function(button, index) {
    button.addEventListener('click', function() {
        deleteOrder(index);
    });
});

function updateOrderStatus(index, newStatus) {
    // Get the order ID from the corresponding order
    const orderId = document.querySelectorAll('.order')[index].querySelector('h2').innerText.replace('Order ID ', '');

    // Use Ajax or fetch to send a request to your server to update the order status
    // Example using fetch:
    fetch(`/update-order-status/${orderId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
    })
    .then(response => response.json())
    .then(data => {
        // Update the status in the DOM
        // Toggle the class of the status span
        const statusSpan = document.querySelectorAll('.order')[index].querySelector('.status span');
        statusSpan.innerText = newStatus;
        
        // Toggle the class between 'preparing' and 'served'
        statusSpan.classList.toggle('preparing', newStatus === 'Preparing');
        statusSpan.classList.toggle('served', newStatus === 'Served');
    })
    .catch(error => console.error('Error:', error));
}

function deleteOrder(index) {
    // Get the order ID from the corresponding order
    const orderId = document.querySelectorAll('.order')[index].querySelector('h2').innerText.replace('Order ID ', '');

    // Use Ajax or fetch to send a request to your server to delete the order
    // Example using fetch:
    fetch(`/delete-order/${orderId}`, {
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
        // Remove the order from the DOM
        document.querySelectorAll('.order')[index].remove();
    })
    .catch(error => console.error('Error:', error));
}

document.addEventListener("DOMContentLoaded", function () {
    const timestamps =document.querySelectorAll(".timestamp");
    timestamps.forEach(function(timestamp){
    const date = new Date(timestamp.textContent);
    const options = {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
        timeZone: "Asia/Manila",
    };
    timestamp.textContent = "Placed on: "+date.toLocaleString("en-US", options);
    });
});