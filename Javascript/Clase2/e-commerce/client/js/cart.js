// Referencias a los elementos del DOM
const verCarrito = document.getElementById("verCarrito");
const modalContainer = document.getElementById("modal-container");

const pintarCarrito = () => {
    modalContainer.innerHTML = "";
    modalContainer.style.display = "flex";

    // Header del modal
    const modalHeader = document.createElement("div");
    modalHeader.className = "modal-header";
    modalHeader.innerHTML = `
        <h1 class="modal-header-title">Carrito</h1>
    `;
    modalContainer.append(modalHeader);

    const modalbutton = document.createElement("h1");
    modalbutton.innerText = "❌";
    modalbutton.className = "modal-header-button";

    modalbutton.addEventListener("click", () => {
        modalContainer.style.display = "none";
    });

    modalHeader.append(modalbutton);

    // Contenido del carrito
    cart.forEach((product) => {
        let carritoContent = document.createElement("div");
        carritoContent.className = "modal-content";
        carritoContent.innerHTML = `
            <img src="${product.img}">
            <h3>${product.productName}</h3>
            <p>${product.price} $</p>
            <p>Cantidad: ${product.quanty}</p>
            <p>Total: ${product.quanty * product.price} $</p>
        `;

        modalContainer.append(carritoContent);
    });

    // Total a pagar
    const total = cart.reduce((acc, el) => acc + el.price * el.quanty, 0);

    const totalBuying = document.createElement("div");
    totalBuying.className = "total-content";
    totalBuying.innerHTML = `Total a pagar: ${total} $`;
    modalContainer.append(totalBuying);
};

// Escuchador de eventos para abrir el modal
if (verCarrito) {
    verCarrito.addEventListener("click", pintarCarrito);
}