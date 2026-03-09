import { chromium, expect } from '@playwright/test';

const SELECTORS = {
    //Login
    usernameInput: '[data-test="username"]',
    passwordInput: '[data-test="password"]',
    loginBtn: '[data-test="login-button"]',
    //Inventory
    addBackPack: '[data-test="add-to-cart-sauce-labs-backpack"]',
    addFleeceJack: '[data-test="add-to-cart-sauce-labs-fleece-jacket"]',
    cartBadgeLink: '[data-test="shopping-cart-badge"]',
    burgerBtn: '#react-burger-menu-btn',
    logoutLink: '[data-test="logout-sidebar-link"]',
    //Cart
    removeBackPack: '[data-test="remove-sauce-labs-backpack"]',
    backtoInventoryBTN:'[data-test="continue-shopping"]',
    checkoutBtn: '[data-test="checkout"]',
    //Checkout Step one
    firstName: '[data-test="firstName"]',
    lastName: '[data-test="lastName"]',
    zipCode: '[data-test="postalCode"]',
    continueButton: '[data-test="continue"]',
    //Checkout Step two
    finishButton: '[data-test="finish"]',
    //Chekout Complete
    title: 'h2',
    backHomeBtn: '[data-test="back-to-products"]'
}

async function login(page,username = 'standard_user', password = 'secret_sauce') {
    await page.fill(SELECTORS.usernameInput, username);
    await page.fill(SELECTORS.passwordInput, password);
    await page.click(SELECTORS.loginBtn);
    await page.waitForLoadState('networkidle');
    await expect(page.url()).toContain('inventory.html');
    console.log(`Login Exitoso con usuario: ${username}`);
}


async function inventoryAndCart(page) {
    async function getCartBadgeCount() {
        const text = await page.locator(SELECTORS.cartBadgeLink).innerText();
        return Number(text) || 0;
    }
    console.log(`Actual Url:${page.url()});`);
    console.log(`Estamos loggeados! sigue agregar un producto`);
    await page.click(SELECTORS.addBackPack);
    await expect(await getCartBadgeCount()).toBe(1);
    console.log('Agregamos un producto! sigue ir al carrito')
    await page.click(SELECTORS.cartBadgeLink);
    await page.waitForLoadState('networkidle');
    await expect(page.url()).toContain(`cart.html`);
    console.log('Navegamos al carrito correctamente! sigue volver al inventario')
    await page.click(SELECTORS.backtoInventoryBTN);
    await page.waitForLoadState('networkidle');
    await expect(page.url()).toContain(`inventory.html`);
    console.log('Estamos en el inventario sigue agregar otro producto')
    await page.click(SELECTORS.addFleeceJack);
    await expect(await getCartBadgeCount()).toBe(2);
    console.log('Agregamos el segundo producto! sigue volver al carrito y quitar un producto')
    await page.click(SELECTORS.cartBadgeLink);
    await page.click(SELECTORS.removeBackPack);
    await expect(await getCartBadgeCount()).toBe(1);
    console.log('Retirar el producto funciono! sigue empezar el checkout');
    await page.click(SELECTORS.checkoutBtn);
}

async function checkout(page,firstName = 'PePe', lastName = 'Tin', zipCode = '51654') {
    await expect(page.url()).toContain(`checkout-step-one.html`);
    console.log('Vamos a agregar los datos para el checkout');
    await page.fill(SELECTORS.firstName, firstName);
    console.log('Primer nombre Listo! sigue colocar el apellido')
    await page.fill(SELECTORS.lastName, lastName);
    console.log('Apellido Listo! sigue colocar el zip code')
    await page.fill(SELECTORS.zipCode, zipCode);
    console.log('Zip Code Listo! sigue avanzar a step two')
    await page.click(SELECTORS.continueButton);
    await page.waitForLoadState('networkidle');
    await expect(page.url()).toContain(`checkout-step-two.html`);
    console.log('Estamos en la ultima seccion del checkout! solo haremos una pasada rapida!')
    await page.click(SELECTORS.finishButton);
    await page.waitForLoadState('networkidle');
    await expect(page.url()).toContain(`checkout-complete.html`);
    console.log('Estamos en los ultimos pasos! comprobamos el titulo y nos volvemos al inventario')
    await expect(page.locator(SELECTORS.title)).toHaveText('Thank you for your order!');
    console.log('El titulo es correcto! hacemos screenshot y vamos al inventario')
    await page.screenshot({path: "Complete-page2.png"})
    console.log(`La comprobacion del titulo funciono! sigue volver al inventario `)
    await page.click(SELECTORS.backHomeBtn);
    await page.waitForLoadState('networkidle');
    await expect(page.url()).toContain(`inventory.html`);
    console.log('el proceso se hizo de forma exitosa! vamos a hacer logout');
}
async function logout(page) {
    await page.click(SELECTORS.burgerBtn);
    await page.click(SELECTORS.logoutLink);
    await page.waitForLoadState('networkidle');
    await expect(page.url()).toBe('https://www.saucedemo.com/');
    console.log('Se Logro!!!')}
(async ()=>{
    const browser = await chromium.launch({headless: false, slowMo: 500});
    const context = await browser.newContext();
    const page = await context.newPage();


    try{
        await page.goto('https://www.saucedemo.com/');
        await page.waitForLoadState('networkidle');
        const initialUrl= page.url();
        console.log(`Aqui comenzamos: ${initialUrl}`);
        await login(page);
        await inventoryAndCart(page);
        await checkout(page);
        await logout(page);
    }catch(error){
        console.error(`Consegui este error:`, error || error.message);
    }finally{
        await browser.close();
    }
})();