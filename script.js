document.addEventListener("DOMContentLoaded", () => {
    const menu = document.querySelector(".menu-mobile-icon");
    const nav = document.querySelector(".navegacao");

    menu.addEventListener("click", () => {
        nav.classList.toggle("ativo");
    });
});
